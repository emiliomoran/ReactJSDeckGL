import React from 'react';
/* import logo from './logo.svg'; */
import './App.css';
import DeckGL from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZW1pbGlvbXAiLCJhIjoiY2s4N2Y1MmlhMG8zeDNsa2xkYnE0MzVqMyJ9.xrbUXf1C9fgQ4Zfoohe1Wg";

const viewState = {
  longitude: 7.623911,
  latitude: 51.957860,
  zoom: 14,
  pitch: 0,
  bearing: 0
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      isLoaded: false,
      tracks: [],
      path_data: [],
      total: undefined,
    };
  }

  componentDidMount() {
    this.get_data();
  }

  get_data = async () => {
    await fetch("https://envirocar.org/api/stable/tracks?bbox=7.545977,51.932676,7.701845,51.983030&limit=300")
      .then(res => res.json())
      .then(
        (result) => {
          const tracks = result.tracks;
          return this.format_data(tracks);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  format_data = async (tracks) => {    
    console.log("Entra a tracks");
    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
      let endpoint = "https://envirocar.org/api/stable/tracks/" + track['id'] + "/measurements";
      await fetch(endpoint)
        .then(res => res.json())
        .then(
          (result) => {
            let path_data = this.state.path_data;
            let item = {
              track: track['id'],
              name: track['sensor']['properties']['model'],
              color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)],
              path: [],
            }
            const features = result.features;
            for (let index2 = 0; index2 < features.length; index2++) {
              const feature = features[index2];
              item.path.push(feature['geometry']['coordinates']);
            }
            path_data.push(item);
            this.setState({
              path_data: path_data,
            }, () => console.log(this.state))
          },
          (error) => {
            console.log(error);
            this.setState({
              isLoaded: true,
              error
            })
          }
        )
    }
    this.setState({
      isLoaded: true,
    })
  }

  render() {

    return (
      <div>
        {
          this.state.isLoaded ?
            <DeckGL
              initialViewState={viewState}
              controller={true}
              layers={[
                new PathLayer({
                  data: this.state.path_data,
                  getPath: d => d.path,
                  getColor: d => d.color,
                  widthScale: 1,
                  widthMinPixels: 2,
                  getWidth: d => 1,
                  opacity: 1,
                  rounded: true,
                  billboard: true,
                })
              ]} // layer here
            >
              <StaticMap
                mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
              />
            </DeckGL> : <span>Loading...</span>
        }
      </div>
    )
  }
}

export default App;
