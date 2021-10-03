import { Marker, Map as PigeonMap } from 'pigeon-maps';
import { memo, useEffect, useState } from 'react';

import axios from 'axios';
import { LocationIllustration } from './Illustrations';
import { useTheme } from '@material-ui/core';

const nominatimBaseURL = 'https://nominatim.openstreetmap.org';

const Map = memo(function Map({ address, height = 300, zoom = 16 }) {
  const [center, setCenter] = useState();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    const getLatLong = async () => {
      setLoading(true);

      if (address) {
        let queryAddress;
        if (typeof address === 'object') {
          queryAddress = `q=${encodeURIComponent(
            [
              address.street1,
              address.street2,
              address.zipCode,
              address.city,
              //`state=${encodeURIComponent(address.state)}`, // state often not recognized
              address.country,
            ].join(' ')
          )}`;
        } else {
          queryAddress = `q=${encodeURIComponent(address)}`;
        }

        try {
          const response = await axios.get(
            `${nominatimBaseURL}/search?${queryAddress}&format=json&addressdetails=1`
          );
          if (response.data?.[0]?.lat && response.data?.[0]?.lon) {
            setCenter([
              Number(response.data[0].lat),
              Number(response.data[0].lon),
            ]);
          } else {
            setCenter();
          }
        } catch (error) {
          console.error(error);
        }
      }

      setLoading(false);
    };

    getLatLong();
  }, [address]);

  return (
    <>
      {!loading && center && (
        <PigeonMap height={height} center={center} zoom={zoom}>
          <Marker
            height={50}
            width={50}
            color={theme.palette.info.main}
            anchor={center}
          />
        </PigeonMap>
      )}
      {!loading && !center && <LocationIllustration height={height} />}
    </>
  );
});

export default Map;
