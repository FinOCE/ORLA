module.exports = async (query) => {
    const mysql = require('mysql2')
    const { Sequelize, QueryTypes } = require('sequelize')
    const sequelize = new Sequelize(
        process.env.database,
        process.env.user,
        process.env.password,
        {
            host: process.env.host,
            dialect: 'mysql'
        }
    )

    const QueryType = {
        select: QueryTypes.SELECT,
        update: QueryTypes.UPDATE,
        insert: QueryTypes.INSERT
    }
    const type = query.split(/ +/)[0].toLowerCase()

    return await sequelize.query(query, { type: QueryType[type], logging: false })
}