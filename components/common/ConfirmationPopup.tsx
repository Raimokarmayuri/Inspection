// import React, { useEffect } from "react";

// export type ConfirmationPopupProps = {
//   show: boolean;
//   headingText?: string;
//   infoText?: React.ReactNode;
//   cancelText?: string;
//   submitText?: string;
//   onCancel: () => void;
//   onSubmit: () => void;
//   /** Close when clicking the dark backdrop */
//   closeOnBackdropClick?: boolean;
// };

// const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
//   show,
//   headingText = "Delete Image",
//   infoText = "Please confirm if you want to delete the selected image",
//   cancelText = "Cancel",
//   submitText = "Delete",
//   onCancel,
//   onSubmit,
//   closeOnBackdropClick = true,
// }) => {
//   // Close on ESC
//   useEffect(() => {
//     if (!show) return;
//     const onKey = (e: KeyboardEvent) => {
//       if (e.key === "Escape") onCancel();
//     };
//     window.addEventListener("keydown", onKey);
//     return () => window.removeEventListener("keydown", onKey);
//   }, [show, onCancel]);

//   if (!show) return null;

//   return (
//     <div
//       className="modal-overlay"
//       role="dialog"
//       aria-modal="true"
//       onClick={() => closeOnBackdropClick && onCancel()}
//     >
//       <div
//         className="approval-modal-content"
//         style={{ height: "auto" }}
//         onClick={(e) => e.stopPropagation()}
//       >
//         <span className="close" onClick={onCancel} aria-label="Close">
//           &times;
//         </span>

//         <h6 className="modal-header">{headingText}</h6>

//         <div className="modal-body">
//           <span>{infoText}</span>

//           <div className="row mt-3">
//             <div>
//               <div className="card-body action_btns d-flex justify-content-end gap-3 flex-wrap flex-sm-nowrap">
//                 <button type="button" className="btn btn-tertiary" onClick={onCancel}>
//                   {cancelText}
//                 </button>
//                 <button type="button" className="btn btn-primary" onClick={onSubmit}>
//                   {submitText}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default React.memo(ConfirmationPopup);
// ConfirmDialog.tsx
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  visible: boolean;
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
  visible,
  title = "Delete image?",
  message = "This will remove the photo from this record.",
  cancelText = "Cancel",
  confirmText = "Delete",
  onCancel,
  onConfirm,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerText}>{title}</Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} onPress={onCancel}>
              <Text style={styles.btnCancelText}>{cancelText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnDelete]} onPress={onConfirm}>
              <Text style={styles.btnDeleteText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#16a34a", // green header
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  body: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  message: {
    color: "#111827",
    fontSize: 14,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    padding: 12,
  },
  btn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnCancel: {
    borderWidth: 1,
    borderColor: "#9ca3af",
    backgroundColor: "#fff",
  },
  btnCancelText: {
    color: "#374151",
    fontWeight: "600",
  },
  btnDelete: {
    backgroundColor: "#dc2626", // red delete button
  },
  btnDeleteText: {
    color: "#fff",
    fontWeight: "700",
  },
});

export default ConfirmDialog;
