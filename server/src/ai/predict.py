#!/usr/bin/env python
"""
Prediction script for the FlavorDiffusion model
This script loads the model and predicts a pairing score for a liquor-ingredient pair
"""

import sys
import os
import argparse
import torch
import pickle

# Add parent directory to path to import modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../ai-server')))

from model.models import NeuralCF
from model.dataset import map_graph_nodes, edges_index

def main():
    parser = argparse.ArgumentParser(description='Predict pairing score')
    parser.add_argument('--liquor_id', type=int, required=True, help='ID of the liquor')
    parser.add_argument('--ingredient_id', type=int, required=True, help='ID of the ingredient')
    args = parser.parse_args()

    try:
        # Load node mappings
        mapping = map_graph_nodes()
        lid_to_idx = mapping['liquor']
        iid_to_idx = mapping['ingredient']

        # Check if IDs exist in mappings
        if args.liquor_id not in lid_to_idx:
            print(f"Error: Liquor ID {args.liquor_id} not found")
            sys.exit(1)
        if args.ingredient_id not in iid_to_idx:
            print(f"Error: Ingredient ID {args.ingredient_id} not found")
            sys.exit(1)

        # Map IDs to indices
        liquor_idx = lid_to_idx[args.liquor_id]
        ingredient_idx = iid_to_idx[args.ingredient_id]

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

        # Make prediction
        with torch.no_grad():
            output = model(
                torch.tensor([liquor_idx]), 
                torch.tensor([ingredient_idx]), 
                edges_indexes, 
                edge_type, 
                edges_weights
            )
            score = float(output.item())
            print(score)

    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
