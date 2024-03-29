/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
const {Pool} = require("pg");
const {nanoid} = require("nanoid");

const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");
const {formatAlbumWithSongs} = require("../../utils");

class AlbumsService {
    constructor() {
        this._pool = new Pool();
    }

    async addAlbum({name, year}) {
        const id = `album-${nanoid(16)}`;
        const query = {
            text: "INSERT INTO album VALUES($1, $2, $3) RETURNING id",
            values: [id, name, year],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError("Album gagal ditambahkan");
        }

        return result.rows[0].id;
    }

    async getAlbumById(id) {
        const queryAlbum = {
            text: "SELECT * FROM album WHERE id = $1",
            values: [id],
        };
        const querySong = {
            text: "SELECT * FROM songs WHERE albumid = $1",
            values: [id],
        };
        const resultAlbum = await this._pool.query(queryAlbum);
        const resultSong = await this._pool.query(querySong);
        if (!resultAlbum.rows.length) {
            throw new NotFoundError("Album tidak ditemukan");
        }

        return formatAlbumWithSongs(resultAlbum, resultSong);
    }

    async editAlbumById(id, {name, year}) {
        const query = {
            text: "UPDATE album SET name = $1, year = $2 WHERE id = $3 RETURNING id",
            values: [name, year, id],
        };

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Gagal memperbarui album. Id tidak ditemukan");
        }
    }

    async deleteAlbumById(id) {
        const query = {
            text: "DELETE FROM album WHERE id=$1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Album gagal dihapus. Id tidak ditemukan");
        }
    }
}

module.exports = AlbumsService;
