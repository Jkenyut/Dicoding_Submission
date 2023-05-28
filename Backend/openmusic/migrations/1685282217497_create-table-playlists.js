/* eslint-disable quotes */
// /* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
      notNull: true,
      unique: true,
    },
    owner: {
      type: 'VARCHAR(50)',
      notNull: false,
      references: '"users"',
      onDelete: 'cascade',
      onUpdate: 'cascade',
    },
  });
};
exports.down = (pgm) => pgm.dropTable('playlists');
