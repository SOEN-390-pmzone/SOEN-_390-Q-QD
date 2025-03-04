# Campus Guide Mobile App - SOEN-390 - Winter 2025

|  Name               |  Student ID  |
| :----------------- | :----------: |
| Atai Askarov        | 40248327     |
| Idris Drouiche      | 40247290     |
| Laurenz Gomez       | 40247966     |
| Mohamed Gueye       | 40247476     |
| Shanvin Luo         | 40248485     |
| Mann Patel          | 40187056     |
| David Ruiz          | 40176885     |
| Micheal Shokralla   | 40209659     |
| Lina Taalba         | 40250168     |
| Jeremy Vieira       | 40246737     |

## Project Description
This project serves as a mobile navigation app for visitors, students, and staff at Concordia University (Montreal), similar to Google Maps.
The app consists of 6 features, implemented throughout a 3-month semester, while following an Agile development methodology:
- Maps of the 2 campuses
- Outdoor directions (between buildings on campus)
- Directions to the building of the next class based off of their Google Calendar or Concordia class schedule
- Indoor directions from a selected building on either campus
- Directions to additional facilities within a building
- (Optional) A smart planner that creates a plan to execute all time-based tasks

The project uses React Native to create a cross-platform app and uses the Expo Go app to demonstrate complete mobile functionality via a QR code.

## Running the project
- Install the Expo Go app on your mobile device
- Create an Expo account or log in to your existing account
- With this repository cloned, go to the `ConcordiaMaps` directory of the project in the terminal and run the following commands
```
npm i expo-cli
npm install
npx expo start
```
- If the terminal returns errors, run the following command in your general directory:
```
npm install --global @expo/ngrok@^4.1.0
```
Then, run the following command inside of the `ConcordiaMaps` directory:
```
npx expo start --tunnel
```
- Scan the generated QR code in the terminal with the Expo Go app for Android or the Camera app for iOS

If everything went well, you should see the mobile app working on your phone.
