const { default: mongoose } = require('mongoose');
const Producto = require('../models/producto');
const { validationResult } = require('express-validator');


exports.getCrearProducto = (req, res) => {
    res.render('admin/editar-producto', {
        titulo: 'Crear Producto',
        path: '/admin/crear-producto',
        modoEdicion: false,
        autenticado: req.session.autenticado,
        mensajeError: null,
        tieneError: false,
        erroresValidacion: []
    })
};

exports.postCrearProducto = (req, res, next) => {
    const nombre = req.body.nombre;
    const urlImagen = req.body.urlImagen;
    const precio = req.body.precio;
    const descripcion = req.body.descripcion;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editar-producto', {
            path: '/admin/editar-producto',
            titulo: 'Crear Producto',
            modoEdicion: false,
            tieneError: true,
            mensajeError: errors.array()[0].msg,
            erroresValidacion: errors.array(),
            producto: {
                nombre: nombre,
                urlImagen: urlImagen,
                precio: precio,
                descripcion: descripcion
            },
        });
    }
    const producto = new Producto({
        // _id: new mongoose.Types.ObjectId('672c1d0333c24b7bc6512672'),
        nombre: nombre, 
        precio: precio, 
        descripcion: descripcion, 
        urlImagen: urlImagen, 
        idUsuario: req.usuario._id });
    producto.save()
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getEditarProducto = (req, res, next) => {
    const modoEdicion = req.query.editar;
    const idProducto = req.params.idProducto;
    Producto.findById(idProducto)
        .then(producto => {
            if (!producto) {
                return res.redirect('admin/productos');
            }
            res.render('admin/editar-producto', {
                titulo: 'Editar Producto',
                path: '/admin/editar-producto',
                producto: producto,
                modoEdicion: true,
                autenticado: req.session.autenticado,
                mensajeError: null,
                tieneError: false,
                erroresValidacion: []
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.postEditarProducto = (req, res, next) => {
    const idProducto = req.body.idProducto;
    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const urlImagen = req.body.urlImagen;
    const descripcion = req.body.descripcion;

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/editar-producto', {
            path: '/admin/editar-producto',
            titulo: 'Editar Producto',
            modoEdicion: true,
            tieneError: true,
            mensajeError: errors.array()[0].msg,
            erroresValidacion: errors.array(),
            producto: {
                nombre: nombre,
                urlImagen: urlImagen,
                precio: precio,
                descripcion: descripcion,
                _id: idProducto
            },
        });
    }

    Producto.findById(idProducto)
        .then(producto => {
            if (producto.idUsuario.toString() !== req.usuario._id.toString()) {
                return res.redirect('/');
            }
            producto.nombre = nombre;
            producto.precio = precio;
            producto.descripcion = descripcion;
            producto.urlImagen = urlImagen;
            return producto.save();
        })
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};



exports.getProductos = (req, res, next) => {
    Producto.find()
        .then(productos => {
            res.render('admin/productos', {
                prods: productos,
                titulo: "Administracion de Productos",
                path: "/admin/productos",
                autenticado: req.session.autenticado
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


exports.postEliminarProducto = (req, res, next) => {
    const idProducto = req.body.idProducto;
    Producto.deleteOne({ _id: idProducto, idUsuario: req.usuario._id })
        .then(result => {
            res.redirect('/admin/productos');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}; 