#!/usr/bin/env python
"""
Recommendation script for the FlavorDiffusion model
This script loads the model and recommends ingredients for a given liquor
"""

import sys
import os
import argparse
import torch
import json
import pickle
import numpy as np

# Add parent directory to path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai-server')))

from model.models import NeuralCF
from model.dataset import map_graph_nodes, edges_index

def main():
    parser = argparse.ArgumentParser(description='Get ingredient recommendations for a liquor')
    parser.add_argument('--liquor_id', type=int, required=True, help='ID of the liquor')
    parser.add_argument('--limit', type=int, default=10, help='Maximum number of recommendations')
    args = parser.parse_args()

    try:
        # Load node mappings
        mapping = map_graph_nodes()
        lid_to_idx = mapping['liquor']
        iid_to_idx = mapping['ingredient']
        
        # Reverse mappings for converting indices back to IDs
        idx_to_lid = {v: k for k, v in lid_to_idx.items()}
        idx_to_iid = {v: k for k, v in iid_to_idx.items()}

        # Check if liquor ID exists in mapping
        if args.liquor_id not in lid_to_idx:
            print(f"Error: Liquor ID {args.liquor_id} not found")
            sys.exit(1)

        # Map liquor ID to index
        liquor_idx = lid_to_idx[args.liquor_id]

        # Load edge indices and model
        edge_type_map = {
            'liqr-ingr': 0,
            'ingr-ingr': 1,
            'liqr-liqr': 1,
            'ingr-fcomp': 2,
            'ingr-dcomp': 2
        }
        
        edges_indexes, edges_weights, edge_type = edges_index(edge_type_map)
        
        # Load model
        model = NeuralCF(num_users=155, num_items=6498, emb_size=128)
        model.load_state_dict(torch.load("../../../ai-server/model/checkpoint/best_model.pth", map_location=torch.device('cpu')))
        model.eval()

        # Get all possible ingredient indices
        ingredient_indices = list(idx_to_iid.keys())
        
        # Create a batch of the same liquor with all ingredients
        liquor_tensor = torch.tensor([liquor_idx] * len(ingredient_indices))
        ingredient_tensor = torch.tensor(ingredient_indices)

        # Make batch prediction
        with torch.no_grad():
            scores = model(
                liquor_tensor, 
                ingredient_tensor, 
                edges_indexes, 
                edge_type, 
                edges_weights
            )
            
            # Convert to numpy and find top N ingredients
            scores_np = scores.numpy()
            top_indices = np.argsort(scores_np)[-args.limit:][::-1]
            
            # Build response
            recommendations = []
            for idx in top_indices:
                ingredient_idx = ingredient_indices[idx]
                ingredient_id = idx_to_iid[ingredient_idx]
                recommendations.append({
                    "ingredient_id": int(ingredient_id),
                    "score": float(scores_np[idx])
                })
            
            # Print as JSON
            print(json.dumps(recommendations))

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
