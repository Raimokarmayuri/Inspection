import { StyleSheet } from 'react-native';

const resetPasswordStyles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: "#1C1831",
  },
   overlay: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.5)',
  },
  
  container: {
     backgroundColor: "#1C1831",
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 34,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 50,
    paddingHorizontal: 20,
    // marginTop:30,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 16,
  },
  appName: {
    fontSize: 38,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 12,
  },
  content: {
    width: '100%',
    alignItems: 'flex-start',
  },
   form: {
    backgroundColor: 'transparent',
    margin:20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subTitle: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
      backgroundColor: '#ffff',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 18,
    fontSize: 20,
    color: 'white',
    borderWidth: 1,
    borderColor: '#777',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  button: {
    backgroundColor: '#F8B84E',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default resetPasswordStyles;
