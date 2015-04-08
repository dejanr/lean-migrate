module.exports = Migration

function Migration(title, before, up, down, after) {
  this.title = title
  this.before = before
  this.up = up
  this.down = down
  this.after = after
}
