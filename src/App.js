import React from 'react';
/* import logo from './logo.svg'; */
import './App.css';
import DeckGL from '@deck.gl/react';
import { PathLayer } from '@deck.gl/layers';
import { StaticMap } from 'react-map-gl';

const MAPBOX_ACCESS_TOKEN = "pk.eyJ1IjoiZW1pbGlvbXAiLCJhIjoiY2s4N2Y1MmlhMG8zeDNsa2xkYnE0MzVqMyJ9.xrbUXf1C9fgQ4Zfoohe1Wg";

const viewState = {
  longitude: 13.388042,
  latitude: 52.517057,
  zoom: 13,
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

  /* componentDidMount() {
    fetch("https://envirocar.org/api/stable/tracks?bbox=13.232174,52.467305,13.543911,52.566752")
      .then(res => res.json())
      .then(
        (result) => {
          let tracks = result.tracks;
          for (let index = 0; index < 2; index++) {
            const track = tracks[index];
            this.format_path(track);
          }
          this.setState({
            tracks: tracks,
            isLoaded: true,
          })
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  } */

  componentDidMount() {
    this.get_data();
  }

  get_data = e => {
    fetch("https://envirocar.org/api/stable/tracks?bbox=13.232174,52.467305,13.543911,52.566752")
      .then(res => res.json())
      .then(
        (result) => {
          const tracks = result.tracks;
          tracks.forEach(track => {
            //const track = tracks[index];
            //Second call to API
            let endpoint = "https://envirocar.org/api/stable/tracks/" + track['id'] + "/measurements?limit=400";
            fetch(endpoint)
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
          })
          this.setState({
            total: tracks.length,
          })
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  }

  /* componentDidMount() {
    fetch("https://envirocar.org/api/stable/tracks/574c63b7e4b09078f97a4266/measurements?limit=400")
      .then(res => res.json())
      .then(
        (result) => {
          this.format_path(result.features);
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
  } */

  /* componentDidMount() {
    let tracks = [
      {
        id: "574c63b7e4b09078f97a4266",
      },
      {
        id: "574c6386e4b09078f97a41d5",
      }
    ];

    for (let index = 0; index < tracks.length; index++) {
      const track = tracks[index];
    fetch("https://envirocar.org/api/stable/tracks/574c63b7e4b09078f97a4266/measurements?limit=400")
      .then(res => res.json())
      .then(
        (result) => {
          let path_data = [];
          let features = result.features;
          let item = {
            name: "Test",
            color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)],
            path: [],
          }
          for (let index2 = 0; index2 < features.length; index2++) {
            const feature = features[index2];
            item.path.push(feature['geometry']['coordinates']);
          }
          path_data.push(item);
          this.setState({
            isLoaded: true,
            path_data: path_data,
          }, () => console.log(this.state))
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
    }
  }
 */
  /* format_path = track => {
    let path_data = this.state.path_data;
    let item = {
      track: track['id'],
      name: track['sensor']['properties']['model'],
      color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)],
      path: [],
    }

    let endpoint = "https://envirocar.org/api/stable/tracks/" + track['id'] + "/measurements";
    fetch(endpoint)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          const features = result.features;
          for (let index2 = 0; index2 < features.length; index2++) {
            const feature = features[index2];
            item.path.push(feature['geometry']['coordinates']);
          }
        },
        (error) => {
          this.setState({
            isLoaded: true,
            error
          })
        }
      )
    path_data.push(item);

    this.setState({
      path_data: path_data,
    }, () => console.log(this.state))
  } */

  format_path = features => {
    let path_data = [];

    for (let index = 0; index < features.length; index++) {
      const feature = features[index];
      let track = feature['properties']['track'];
      let index_found = -1;
      path_data.map((item, index) => {
        if (item.track === track) {
          index_found = index;
        }
      })

      if (index_found >= 0) {
        //console.log("Entra a igual");
        let item = path_data[index_found];
        item.path.push(feature['geometry']['coordinates'])
      } else {
        console.log("Entra a nuevo");
        console.log(track);
        let item = {
          track: track,
          name: feature['properties']['sensor']['properties']['model'],
          color: [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)],
          path: [feature['geometry']['coordinates']],
        }
        path_data.push(item);
      }
    }

    this.setState({
      isLoaded: true,
      path_data: path_data,
    }, () => console.log(this.state))
  }

  render() {

    /* const { path_data, isLoaded } = this.state; */
    /* console.log(path_data);
    const layers = [
      new PathLayer({
        data: path_data,
        getPath: d => d.path,
        getColor: d => d.color,
        widthScale: 1,
        widthMinPixels: 2,
        getWidth: d => 1,
        opacity: 1,
        rounded: true,
        billboard: true,
        onHover: ({ object, x, y }) => {
          const tooltip = object.name;          
        }
      })
    ]; */

    return (
      <div>
        {
          this.state.total === this.state.path_data.length ?
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
                  onHover: ({ object, x, y }) => {
                    const tooltip = object.name;
                    /* Update tooltip
                       http://deck.gl/#/documentation/developer-guide/adding-interactivity?section=example-display-a-tooltip-for-hovered-object
                    */
                  }
                })
              ]} // layer here
            >
              <StaticMap
                /* mapStyle="mapbox://styles/mapbox/streets-v11" */
                mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN}
              />
            </DeckGL> : <span>Loading...</span>
        }
      </div>
    )
  }
}

export default App;
