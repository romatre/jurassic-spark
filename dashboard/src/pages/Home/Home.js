import React from 'react';
import JurassicSpark from "../../JurassicSpark";
import Page from '../../components/PageComponent/PageComponent'
require('./home.css');

class Home extends JurassicSpark {

  constructor (props) {
    super(props);
    this.api.get('periodicTransactions/outbound', null, { limit: 1000 })
      .then(transactions => this.updatedTransactions(transactions));
    this.getEmitter().addListener('update', () => {
      this.forceUpdate();
    });
  }

  render() {
    return (
      <Page title="Jurassic Spark">
        <div className="Home">

          <h1 className="Home__title">Il progetto</h1>
          <div  className="Home__columns__entry">
            <p><strong>JurassicSpark</strong> è un progetto realizzato durante il corso di <a rel="noopener noreferrer" target="_blank" href="http://www.dia.uniroma3.it/~infovis/">Visualizzazione dell'informazione</a> e <a rel="noopener noreferrer" target="_blank" href="http://torlone.dia.uniroma3.it/bigdata/">Big data</a> tenuto a Roma Tre rispettivamente dai Professori Maurizio Patrignani (aka Titto) e Riccardo Torlone.</p>
            <p>Lo strumento è stato realizzato per permettere la visualizzazione di pattern periodici tra le transazioni avvenute sulla blockchain Ethereum.</p>
          </div>

          <h2>Il team</h2>
          <ul>
            <li>Alessio Zoccoli <a rel="noopener noreferrer" target="_blank" href="https://github.com/AlessioZoccoli">@AlessioZoccoli</a></li>
            <li>Federico Ginosa <a rel="noopener noreferrer" target="_blank" href="https://github.com/menxit">@menxit</a></li>
          </ul>

        </div>
      </Page>
    );
  }
}

export default Home
