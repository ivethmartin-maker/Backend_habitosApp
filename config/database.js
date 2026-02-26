const mongoose = require('mongoose' )

// Funcion para conectar la aplicacion con la base de datos MongoDB
const connectDB = async () => {
    try {
        await mongoose. connect(process.env.MONGO_URI)
        // Conexion exitosa
        console. log('Conectado correctamente a MongoDB' )
    } catch (error) {
        // Error al conectar
        console.error( 'Error al conectar con Mongodb: ', error.message)

        // Detiene la ejecucion del servidor si ocurre un error critico
        process.exit(1)
    }
}
module. exports = connectDB
