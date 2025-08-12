import { Platform, StyleSheet } from "react-native";

const CARD_BG = "#1C1831";
const BG = "#1C1831";
const BRAND = "#F8B84E";
const BRAND_DARK = "#E7A93D";
const ACCENT = "#F8B133";
const TEXT_LIGHT = "#ffffff";
const TEXT_MUTED = "#cccccc";
const INPUT_BG = "#ffffff";
const INPUT_BORDER = "#DADCE0";
const INPUT_FOCUS = "#7AA7FF";
const ERROR = "#D93025";

const loginStyles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#1C1831",
    width: "100%",
    height: "100%",
  },
    // card container (looks good on phones and tablets)
  card: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 520,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#1C1831",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
 safe: {
    flex: 1,
    backgroundColor: BG,
  },
  kav: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 50,
  },

  logo: {
    width: 130,
    height: 130,
    marginBottom: 12,
  },

  loginHeading: {
    fontSize: 34,
    color: "white",
    fontWeight: "bold",
    marginBottom: 6,
  },

  loginSub: {
    fontSize: 16,
    color: "#ccc",
    marginBottom: 24,
    textAlign: "center",
  },

  form: {
    backgroundColor: "transparent",
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#222121ff",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },

  forgot: {
    color: "#F8B133",
    fontSize: 14,
    textAlign: "right",
    marginBottom: 16,
  },

  loginBtn: {
    backgroundColor: "#F8B84E",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },

  loginBtnText: {
    fontWeight: "bold",
    color: "#1C1831",
    fontSize: 16,
  },

  error: {
    color: "red",
    marginBottom: 12,
    textAlign: "center",
    fontSize: 13,
  },

  row: {
    flexDirection: "column",
    alignItems: "center",
    marginTop: 20,
  },

  otpBox: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 16,
  },

 otpInput: {
  width: 48,
  height: 58,
  borderWidth: 1,
  borderColor: "#ccc",
  borderRadius: 8,
  marginHorizontal: 5,
  fontSize: 20,
  textAlign: "center",
  backgroundColor: "#ffffff", // ✅ White background
  color: "#000000",           // ✅ Black text
},


  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: 8,
    textAlign: "center",
  },

  subTitle: {
    fontSize: 14,
    color: "#cccccc",
    marginBottom: 24,
    lineHeight: 20,
    textAlign: "center",
  },

  backText: {
    marginTop: 16,
    color: "#F8B133",
    textAlign: "center",
    fontSize: 14,
  },
});

export default loginStyles;
