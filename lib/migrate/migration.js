module.exports = Migration

function Migration(title, before, up, down, zen) {
  this.title = title
  this.before = before
  this.up = up
  this.down = down
}
