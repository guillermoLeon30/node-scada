const mongoose = require('mongoose');

const Equipment = require('./equipment');

const Schema = mongoose.Schema;

const sensorSchema = new Schema({
  tipo: {
    type: String,
    required: true
  },
  unidad: {
    type: String,
    required: true
  },
  marca: {
    type: String,
    required: true
  },
  modelo: {
    type: String,
    required: true
  },
  serie: {
    type: String,
    required: true
  },
  ubicacion: {
    type: String,
    required: true
  },
  estado: {
    type: Boolean,
    default: true
  },
  idEquipo: {
    type: Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  }
});

sensorSchema.statics.sensores =  async function (req) {
  const currentPage = req.query.page || 1;
  const idEquipo = req.params.idEquipment;
  const perPage = 5;

  try {
    const equipo = await Equipment.findById(idEquipo);
    const totalItems = await this.find({ idEquipo: idEquipo }).countDocuments();
    const sensores = await this.find({ idEquipo: idEquipo })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    return {
      equipo: equipo,
      sensores: sensores,
      pagination: {
        currentPage: currentPage,
        totalItems: totalItems,
        perPage: perPage,
        maxPage: Math.ceil(totalItems/perPage),
        viewPage: 5,
        offset: 2,
        url: '/admin/sensores/' + idEquipo
      }

    }
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

sensorSchema.statics.registrar = async function (data) {
  const { tipo, unidad, marca, modelo, serie, ubicacion, idEquipment } = data;
  
  try {
    const equipo = await Equipment.findById(idEquipment);

    if (!equipo) {
      throw new Error();
    }

    const sensor = await this.create({
      tipo: tipo,
      unidad: unidad,
      marca: marca,
      modelo: modelo,
      serie: serie,
      ubicacion: ubicacion,
      idEquipo: idEquipment
    });

    equipo.sensores.push(sensor);

    await equipo.save();

    return sensor;
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

sensorSchema.methods.actualizar = async function (data) {
  try {
    this.tipo = data.tipo || this.tipo;
    this.unidad = data.unidad || this.unidad;
    this.marca = data.marca || this.marca;
    this.modelo = data.modelo || this.modelo;
    this.serie = data.serie || this.serie;
    this.ubicacion = data.ubicacion || this.ubicacion;
    this.estado = data.estado || this.estado;

    await this.save();
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

module.exports = mongoose.model('Sensor', sensorSchema);
