import { StyleSheet } from 'react-native';

const verificationStyles = StyleSheet.create({
  background: {
    flex: 1,
     backgroundColor: "#1C1831",
  },
  container: {
    
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 34,
  },
  logoContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: 70,
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
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    width: '100%',
  },
  otpInput: {
    width: 55,
    height: 55,
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '600',
    color: '#000',
  },
  resendText: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 24,
  },
  resendLink: {
    color: '#F8B133',
    fontWeight: '600',
  },
  button: {
    width: '100%',
    backgroundColor: '#F8B133',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#000',
    fontWeight: 'bold',
  },
});

export default verificationStyles;
