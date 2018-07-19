class Storage {

  state = undefined


  setInitialState(state) {
    if (this.state === undefined) {
      this.state = state;
    }
    return this;
  }

  update(callback) {
    this.state = Object.assign({}, this.state, callback(this.state));
  }

}

export default new Storage();
