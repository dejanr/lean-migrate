module.exports = Migration

function Migration(title, up, down, zen) {
  this.title = title
  this.up = up
  this.down = down
  this.zen = zen
}
