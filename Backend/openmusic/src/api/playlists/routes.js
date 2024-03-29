/* eslint-disable quotes */
const routesPlaylist = (handler) => [
    {
        method: "POST",
        path: "/playlists",
        handler: handler.postPlaylistHandler,
        options: {
            auth: "notesapp_jwt",
        },
        // save
    },
    {
        method: "GET",
        path: "/playlists",
        handler: handler.getPlaylistHandler,
        options: {
            auth: "notesapp_jwt",
        }, // getbyid
    },
    {
        method: "POST",
        path: "/playlists/{id}/songs",
        handler: handler.postPlaylistSongByIdHandler,
        options: {
            auth: "notesapp_jwt",
        }, // getbyid
    },
    {
        method: "GET",
        path: "/playlists/{id}/songs",
        handler: handler.getPlaylistSongByIdHandler,
        options: {
            auth: "notesapp_jwt",
        }, // getbyid
    },
    {
        method: "DELETE",
        path: "/playlists/{id}/songs",
        handler: handler.deletePlaylistSongByIdHandler,
        options: {
            auth: "notesapp_jwt",
        }, // delete by id
    },
    {
        method: "DELETE",
        path: "/playlists/{id}",
        handler: handler.deletePlaylistByIdHandler,
        options: {
            auth: "notesapp_jwt",
        }, // delete by id
    },
];

module.exports = routesPlaylist;
