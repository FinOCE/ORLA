import {Sequelize, QueryTypes} from 'sequelize'

export default class Database {
    private data: any

    constructor(data: any) {
        this.data = data
    }
    static async query(query: string) {
        const sequelize = new Sequelize(
            process.env.database!,
            process.env.user!,
            process.env.password!,
            {
                host: process.env.host!,
                dialect: 'mysql'
            }
        )

        const QueryType: Record<string, any> = {
            select: QueryTypes.SELECT,
            update: QueryTypes.UPDATE,
            insert: QueryTypes.INSERT
        }
        const type = query.split(/ +/)[0].toLowerCase()
    
        const response = await sequelize.query(query, {type: QueryType[type], logging: false})
        if (type === 'select') {
            let data: any
            if (query.split(/ +/g)[1] !== '*') {
                // If query isn't "SELECT * ...", rename rows to not have backticks in their key
                data = []
                response.forEach((row: any) => {
                    data.push(row[query.split(/ +/g)[1].replace(/`/g, '')])
                })
            } else {
                // If query is "SELECT * ..."
                data = response
            }
            return new Database(data)
        }
    }

    exists() {
        return (0 in this.data)
    }
    getAll() {
        return this.data
    }
    getFirst() {
        return this.data[0]
    }

    trim() {
        this.data = this.data.filter((row: any) => row !== null)
        return this
    }
}