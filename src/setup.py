"""

Copyright (c) 2015 Robert Hodgen. All rights reserved.

"""


import model


def default_project_labels(project):
    """ Create the default Labels for a new Project. """
    enahncement = model.Label.create_label('Enhancement',
        '#4a89dc', project.key)
    bug = model.Label.create_label('Bugs', '#da4453', project.key)
    idea = model.Label.create_label('Idea', '#967acd', project.key)
    question = model.Label.create_label('Question', '#ffce54', project.key)
    feature = model.Label.create_label('Feature', '#37bc9b', project.key)
