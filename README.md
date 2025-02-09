# Campus Guide Mobile App - SOEN-390 - Winter 2025

|  Name               |  Student ID  |
| :-----------------: | :----------: |
| Atai Askarov        | 40248327     |
| Shanvin Luo         | 40248485     |
| Mann Patel          | 40187056     |
| Jeremy Vieira       | 40246737     |
| David Ruiz          | 40176885     |
| Mohamed Gueye       | 40247476     |
| Laurenz Gomez       | 40247966     |
| Lina Taalba         | 40250168     |
| Idris Drouiche      | 40247290     |
| Micheal Shokralla   | 40209659     |

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

## Acceptance Tests
**US-1**
Links to AT-1: https://github.com/SOEN-390-pmzone/SOEN-_390-Q-QD/issues/93

![screen-20250209-114203](https://github.com/user-attachments/assets/816c5cbf-568d-4b55-9f2a-a6ccb21fcbcd)


**US-2**
Links to AT-2: https://github.com/SOEN-390-pmzone/SOEN-_390-Q-QD/issues/94

![Distinguish Campus](https://github.com/user-attachments/assets/ca1200d1-84d5-4eab-9ec9-33d43699789e)

**US-3**
Links to AT-3:https://github.com/SOEN-390-pmzone/SOEN-_390-Q-QD/issues/95

![Toggle campus](https://github.com/user-attachments/assets/8378eff2-30cf-4b14-8e70-5a3d76cddd6e)

**US-4**
Links to AT-4: https://github.com/SOEN-390-pmzone/SOEN-_390-Q-QD/issues/96

![Show Location](https://github.com/user-attachments/assets/95dcd608-9c63-4d26-8086-1b2f00cb2ff8)


**US-5**
Links to AT-5: https://github.com/SOEN-390-pmzone/SOEN-_390-Q-QD/issues/97

![Popup](https://github.com/user-attachments/assets/d48ac1d8-b520-44a0-b34a-314b81e68df8)


