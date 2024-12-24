"""
postprocessor.py

Contains functions to postprocess predictions or reasoning results.
"""

import logging

def format_results(results):
    """
    Format the results to a standardized structure or add metadata.
    """
    logging.info("Postprocessing results.")
    # Example: wrap in a dictionary with a status
    return {"status": "success", "data": results}
