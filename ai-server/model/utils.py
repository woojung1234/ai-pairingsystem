#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Utility functions for FlavorDiffusion Model
"""

import torch
import os
import sys

def load_checkpoint(checkpoint_path, model, optimizer=None, device='cpu'):
    """
    Load model checkpoint
    
    Args:
        checkpoint_path (str): Path to checkpoint file
        model (torch.nn.Module): Model to load state into
        optimizer (torch.optim.Optimizer, optional): Optimizer to load state into
        device (str): Device to load checkpoint on
    
    Returns:
        bool: True if loaded successfully, False otherwise
    """
    try:
        if not os.path.exists(checkpoint_path):
            print(f"Checkpoint file not found: {checkpoint_path}", file=sys.stderr)
            return False
        
        # Load checkpoint
        checkpoint = torch.load(checkpoint_path, map_location=device)
        
        # Load model state
        if 'model_state_dict' in checkpoint:
            model.load_state_dict(checkpoint['model_state_dict'])
        elif 'state_dict' in checkpoint:
            model.load_state_dict(checkpoint['state_dict'])
        else:
            # Assume the checkpoint is just the state dict
            model.load_state_dict(checkpoint)
        
        # Load optimizer state if provided
        if optimizer is not None and 'optimizer_state_dict' in checkpoint:
            optimizer.load_state_dict(checkpoint['optimizer_state_dict'])
        
        print(f"Successfully loaded checkpoint from {checkpoint_path}")
        return True
        
    except Exception as e:
        print(f"Error loading checkpoint: {str(e)}", file=sys.stderr)
        return False

def save_checkpoint(checkpoint_path, model, optimizer=None, epoch=None, loss=None, **kwargs):
    """
    Save model checkpoint
    
    Args:
        checkpoint_path (str): Path to save checkpoint
        model (torch.nn.Module): Model to save
        optimizer (torch.optim.Optimizer, optional): Optimizer to save
        epoch (int, optional): Current epoch
        loss (float, optional): Current loss
        **kwargs: Additional data to save
    """
    try:
        checkpoint = {
            'model_state_dict': model.state_dict(),
        }
        
        if optimizer is not None:
            checkpoint['optimizer_state_dict'] = optimizer.state_dict()
        
        if epoch is not None:
            checkpoint['epoch'] = epoch
        
        if loss is not None:
            checkpoint['loss'] = loss
        
        # Add any additional data
        checkpoint.update(kwargs)
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(checkpoint_path), exist_ok=True)
        
        torch.save(checkpoint, checkpoint_path)
        print(f"Checkpoint saved to {checkpoint_path}")
        
    except Exception as e:
        print(f"Error saving checkpoint: {str(e)}", file=sys.stderr)

def normalize_score(score, min_val=0.0, max_val=1.0):
    """
    Normalize score to be within specified range
    
    Args:
        score (float): Raw score to normalize
        min_val (float): Minimum value for normalized score
        max_val (float): Maximum value for normalized score
    
    Returns:
        float: Normalized score
    """
    # Clamp score to reasonable bounds first
    score = max(-10, min(10, score))
    
    # Apply sigmoid to get 0-1 range
    if isinstance(score, torch.Tensor):
        normalized = torch.sigmoid(score).item()
    else:
        import math
        normalized = 1 / (1 + math.exp(-score))
    
    # Scale to desired range
    return min_val + normalized * (max_val - min_val)

def get_device():
    """Get the best available device for computation"""
    if torch.cuda.is_available():
        return torch.device('cuda')
    else:
        return torch.device('cpu')

def set_seed(seed=42):
    """Set random seed for reproducibility"""
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)
        torch.cuda.manual_seed_all(seed)
    
    import random
    import numpy as np
    random.seed(seed)
    np.random.seed(seed)

def count_parameters(model):
    """Count the number of trainable parameters in a model"""
    return sum(p.numel() for p in model.parameters() if p.requires_grad)

def load_node_embeddings(embedding_path):
    """
    Load pre-computed node embeddings
    
    Args:
        embedding_path (str): Path to embedding file
    
    Returns:
        torch.Tensor: Node embeddings
    """
    try:
        if os.path.exists(embedding_path):
            embeddings = torch.load(embedding_path)
            print(f"Loaded embeddings from {embedding_path}")
            return embeddings
        else:
            print(f"Embedding file not found: {embedding_path}", file=sys.stderr)
            return None
    except Exception as e:
        print(f"Error loading embeddings: {str(e)}", file=sys.stderr)
        return None

def create_dummy_embeddings(num_nodes, embedding_dim=64):
    """
    Create dummy embeddings for testing purposes
    
    Args:
        num_nodes (int): Number of nodes
        embedding_dim (int): Dimension of embeddings
    
    Returns:
        torch.Tensor: Random embeddings
    """
    return torch.randn(num_nodes, embedding_dim)
