import {useState, useEffect} from "react"
import {View, Button, Text} from "react-native"
import axios from "axios"
function Toggle(){

        
        const [postalCode, setPostalCode] = useState('H3G 1M8');
        const [coordinates, setCoordinates] = useState(null);
        const [error, setError] = useState('');
        
        const convertToCoordinates = async (postal_code) => {
            const key = "AIzaSyAW8gOP1PJiZp1br3kOPSlRYdPlDoGkkR4";
            try {
                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${postal_code}&key=${key}`);
                const { status, results } = response.data;
    
                
                if (status === 'OK') {
                    if (results.length > 0) {
                        const { lat, lng } = results[0].geometry.location;
                        setCoordinates({ latitude: lat, longitude: lng });
                        setError('');
                    } else {
                        setCoordinates(null);
                        setError('No results found.');
                    }
                } else {
                    setCoordinates(null);
                    setError(`Error: ${status}`);
                }
            } catch (error) {
                console.error('Error:', error);
                setCoordinates(null);
                setError('Something went wrong. Please try again later.');
            }
            
            
        };
        
        useEffect(() => {
            convertToCoordinates(postalCode);

      }, [postalCode]); 
      const handleButtonPress = () => {
        setPostalCode(prevPostalCode => prevPostalCode === 'H3G 1M8' ? 'H4B 1R6' : 'H3G 1M8');

    };
      
    return (
        <View>
            <Button title={postalCode}  onPress={handleButtonPress} />
            {coordinates ? (
                <Text>Coordinates: {coordinates.latitude}, {coordinates.longitude}</Text>
            ) : (
                <Text>Loading...</Text>
            )}
            {error ? <Text>Error: {error}</Text> : null}
        </View>
    )

}
export default Toggle;