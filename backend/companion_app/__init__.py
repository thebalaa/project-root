"""
Companion App Package
"""

import os
import sys

# Add the package root to Python path
package_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if package_root not in sys.path:
    sys.path.append(package_root)

# Optional: Set up any package-level configuration
DEFAULT_MODEL = "all-MiniLM-L6-v2"  # Default model for sentence transformers

# Version info
__version__ = "0.1.0"
