import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.nn import MessagePassing
import pickle

"""
all_node_emb = GNN(edge_index)
liquor_emb = all_node_emb[liquor_ids]
ingredient_emb = all_node_emb[ingredient_ids]
score = MLP(concat(liquor_emb, ingredient_emb))
loss = BCE(score, label)
loss.backward()
"""

class NeuralCF(nn.Module):
    def __init__(self, num_users, num_items, num_nodes=8298, num_relations=2, emb_size=128,
                 hidden_layers=[128, 64, 32], emb_init_path=None,
                 edge_index=None, edge_type=None, edge_weight=None):
        super(NeuralCF, self).__init__()
        self.num_nodes = num_nodes

        # GNN 구조 저장
        self.edge_index = edge_index
        self.edge_type = edge_type
        self.edge_weight = edge_weight

        self.embedding = nn.Embedding(num_nodes, emb_size)

        if emb_init_path is not None:
            with open(emb_init_path, "rb") as f:
                emb_init = pickle.load(f)
            with torch.no_grad():
                for idx, (node_idx, init_vector) in enumerate(emb_init.items()):
                    self.embedding.weight[idx] = torch.tensor(init_vector, dtype=torch.float32)

        self.norm1 = nn.LayerNorm(emb_size)

        self.wrgcn = WeightedRGCNConv(emb_size, emb_size, num_relations)
        self.wrgcn2 = WeightedRGCNConv(emb_size, emb_size, num_relations)

        layers = []
        input_size = emb_size * 2
        for h in hidden_layers:
            layers.append(nn.Linear(input_size, h))
            layers.append(nn.ReLU())
            layers.append(nn.Dropout(0.2))
            input_size = h
        self.mlp = nn.Sequential(*layers)
        self.output_layer = nn.Linear(hidden_layers[-1] + emb_size, 1)

    def forward(self, user_indices, item_indices, is_embbed=False):
        # 내부에 저장된 그래프 정보 사용
        edge_index = self.edge_index
        edge_type = self.edge_type
        edge_weight = self.edge_weight

        x = self.embedding(torch.arange(self.num_nodes, device=edge_index.device))
        x = self.wrgcn(x, edge_index, edge_type, edge_weight)
        x = F.relu(x)
        x = F.dropout(x, p=0.2, training=self.training)
        x = self.norm1(x)
        x = self.wrgcn2(x, edge_index, edge_type, edge_weight)

        if is_embbed:
            return x

        gmf_user_emb = x[user_indices]
        gmf_item_emb = x[item_indices]
        mlp_user_emb = x[user_indices]
        mlp_item_emb = x[item_indices]

        gmf_user_emb = F.normalize(gmf_user_emb, dim=-1)
        gmf_item_emb = F.normalize(gmf_item_emb, dim=-1)

        gmf_output = gmf_user_emb * gmf_item_emb
        mlp_input = torch.cat([mlp_user_emb, mlp_item_emb], dim=-1)
        mlp_output = self.mlp(mlp_input)

        final_input = torch.cat([gmf_output, mlp_output], dim=-1)
        score = self.output_layer(final_input).squeeze()

        return score

class WeightedRGCNConv(MessagePassing):
    def __init__(self, in_channels, out_channels, num_relations, aggr='add', bias=True):
        super().__init__(aggr=aggr)
        self.num_relations = num_relations
        self.in_channels = in_channels
        self.out_channels = out_channels

        # 각 관계(r)마다 weight matrix 생성
        self.rel_lins = nn.ModuleList([
            nn.Linear(in_channels, out_channels, bias=False) for _ in range(num_relations)
        ])

        self.root = nn.Linear(in_channels, out_channels, bias=False)  # 자기 자신
        self.bias = nn.Parameter(torch.Tensor(out_channels)) if bias else None
        self.reset_parameters()

    def reset_parameters(self):
        for lin in self.rel_lins:
            lin.reset_parameters()
        self.root.reset_parameters()
        if self.bias is not None:
            nn.init.zeros_(self.bias)

    def forward(self, x, edge_index, edge_type, edge_weight=None):
        """
        x: [num_nodes, in_channels]
        edge_index: [2, num_edges]
        edge_type: [num_edges]
        edge_weight: [num_edges] or None
        """
        
        if edge_weight is None:
            edge_weight = torch.ones(edge_index.size(1), device=edge_index.device)

        return self.propagate(edge_index, x=x, edge_type=edge_type, edge_weight=edge_weight)

    def message(self, x_j, edge_type, edge_weight):
        """
        x_j: source node features [num_edges, in_channels]
        edge_type: edge types [num_edges]
        edge_weight: edge weights [num_edges]
        """

        # 각 관계에 따라 다른 transformation
        out = torch.zeros(x_j.size(0), self.out_channels, device=x_j.device)

        for r in range(self.num_relations):
            mask = edge_type == r
            if mask.sum() > 0:
                transformed = self.rel_lins[r](x_j[mask])
                out[mask] = edge_weight[mask].unsqueeze(-1) * transformed

        return out

    def update(self, aggr_out, x):
        out = aggr_out + self.root(x)
        if self.bias is not None:
            out = out + self.bias
        return out