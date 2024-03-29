const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');

const Usuario = require('../models/usuario');

const {verificaToken, verificaAdmin_Role} = require('../middlewares/autenticacion');

const app = express();

app.get('/usuario', [verificaToken],(req, res) => {
    // return res.json({
    //     usuario: req.usuario,
    //     nombre: req.usuario.nombre,
    //     email: req.usuario.email,
    // });
    console.log(req.usuario);
    let desde = req.query.desde || 0;
    desde = Number(desde);
    let limite = req.query.limite || 100;
    limite = Number(limite);

    Usuario.find({estado: true}, 'nombre email role estado google role img') // Permite excluir los valores que se quieren mostrar { campo con condicion}
        .skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err: err
                });
            }
            Usuario.count({estado: true},(err, conteo) => {
                res.json({
                    ok: true,
                    usuarios,
                    conteo
                });
            });

        });
});

app.post('/usuario',[verificaToken,verificaAdmin_Role], (req, res) => {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    });
    usuario.save((err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

app.put('/usuario/:id',[verificaToken,verificaAdmin_Role], (req, res) => {
    let id = req.params['id'];
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'role', 'estado']);
    Usuario.findOneAndUpdate(id, body, {new: true, runValidators: true}, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id',[verificaToken,verificaAdmin_Role], (req, res) => {
    let id = req.params['id'];
    let cambioEstado = {
        estado:false
    };
    Usuario.findOneAndUpdate(id, cambioEstado, {new: true}, (err, usuarioDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado'
                }
            });
        }
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });
});

module.exports = app;



