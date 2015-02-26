"""

Copyright (c) 2015 Robert Hodgen. All rights reserved.

"""


import string

import re


def permalinkify(string):
  """ Return a clean URL-friendly version of `string`. """
  clean = string.lower().strip() # lowercase, striped of whitespace
  clean = re.sub(r'\s(\s*)?', '-', clean) # Replace spaces with dashes "-"
  clean = re.sub(r'[^a-z0-9-]', '', clean) # Strip non-alphanumeric
  return clean

