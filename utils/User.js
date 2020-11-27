module.exports.User = class User {
    constructor(json) {
        Object.keys(json).forEach(p => this[p] = json[p])
    }
    static async build(client, json) {
        json.client = client
        return new User(json)
    }
    Experience() {
        const {Experience} = require('./Experience')
        return new Experience(this)
    }
}