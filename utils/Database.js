module.exports.Database = class Database {
    // ----- Setup -----
    constructor(json) {
        this.json = json
    }
    static async query(query) {
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
    
        let response = await sequelize.query(query, { type: QueryType[type], logging: false })
        if (type === 'select') {
            let json = []
            if (query.split(/ +/g)[1] !== '*') {
                response.forEach(row => {
                    json.push(row[query.split(/ +/g)[1].replace(/`/g, '')])
                })
            } else {
                json = response
            }

            return new Database(json)
        }
    }

    // ----- Queries -----
    exists() {
        return (0 in this.json) ? true : false
    }
    getAll() {
        return this.json
    }
    getFirst() {
        return this.json[0]
    }

    // ----- Actions -----
    trim() {
        this.json = this.json.filter(row => row !== null)
        return this
    }
}