'use strict';
const Project = require('../models/project');

exports.get = function(req, res) {
    switch (req.params.type) {
        case 'project': {
            Project.findById(req.params.id, function(err, project) {
                if (err) return res.json({error:true, message: "Проект не существует"})

                res.json({
                    title: project.title + ' | Quantum',
                    description: project.description,
                    ogSiteName: 'Quantum | Проекты',
                    ogType: 'article',
                    ogTitle: project.title,
                    ogDescription: project.description,
                    ogImage: project.image,
                });
            })
            break
        }

        default: {
            return res.json({})
        }
    }
};
