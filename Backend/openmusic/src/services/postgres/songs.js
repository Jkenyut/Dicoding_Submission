/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
/* eslint-disable quotes */
/* eslint-disable no-underscore-dangle */
/* eslint-disable import/no-extraneous-dependencies */
const {Pool} = require("pg");
const {nanoid} = require("nanoid");
// const { mapDBToModel } = require("../../utils");
const InvariantError = require("../../exceptions/InvariantError");
const NotFoundError = require("../../exceptions/NotFoundError");

class SongsService {
    constructor() {
        this._pool = new Pool();
    }

    async addSong({title, year, genre, performer, duration, albumId}) {
        const id = `song-${nanoid(16)}`;
        const query = {
            text: "INSERT INTO songs VALUES($1, $2, $3,$4,$5,$6,$7) RETURNING id",
            values: [id, title, year, genre, performer, duration, albumId],
        };
        const result = await this._pool.query(query);
        if (!result.rows[0].id) {
            throw new InvariantError("Song gagal ditambahkan");
        }

        return result.rows[0].id;
    }

    async getSong({title = "", performer = ""}) {
        const query = {
            text: "SELECT id,title,performer FROM songs WHERE  LOWER(title) LIKE $1 AND LOWER(performer) LIKE $2",
            values: [`%${title}%`, `%${performer}%`],
        };
        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFoundError("Songs tidak ditemukan");
        }
        return result.rows;
    }

    async getSongById(id) {
        const query = {
            text: "SELECT * FROM songs WHERE id = $1",
            values: [id],
        };
        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Song tidak ditemukan");
        }
        return result.rows[0];
    }

    // service edit song by id
    async editSongById(id, {title, year, genre, performer, duration, albumId}) {
        const query = {
            text: "UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, albumid = $6 WHERE id = $7 RETURNING id",
            values: [title, year, genre, performer, duration, albumId, id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Gagal memperbarui song. Id tidak ditemukan");
        }
    }

    // service
    async deleteSongById(id) {
        const query = {
            text: "DELETE FROM songs WHERE id=$1 RETURNING id",
            values: [id],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new NotFoundError("Song gagal dihapus. Id tidak ditemukan");
        }
    }
}

module.exports = SongsService;
