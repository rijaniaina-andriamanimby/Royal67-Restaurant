import Swal from "sweetalert2"
import { toast } from "react-toastify"
import { toastTheme } from "./toastTheme"

const options = {
    autoClose: 1000,
    pauseOnHover: false,
    draggable: true,
}

const styledToast = (type, message) => {
    toast[type](message, {
        ...options,
        style: {
            background: toastTheme[type].bg,
            color: "#fff",
        },
        progressStyle: {
            background: toastTheme[type].progress,
        },
    })
}

const FeedbackService = {
    show: (icon = "success", title = "Opération réussie", text = "") => {
        Swal.fire({
            icon,
            title,
            text,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,

        })
    },

    success: (text = "Action effectuée avec succès !") => {
        // FeedbackService.show("success", "Succès", text)
        styledToast("success", text)
    },

    error: (text = "Une erreur est survenue !") => {
        // FeedbackService.show("error", "Erreur", text)
        styledToast("error", text)
    },

    warning: (text = "Attention !") => {
        // FeedbackService.show("warning", "Avertissement", text)
        styledToast("warning", text)
    },

    info: (text = "Information") => {
        // FeedbackService.show("info", "Info", text)
        styledToast("info", text)
    },
    confirm: async (text = "Voulez-vous vraiment supprimer ?") => {
        const result = await Swal.fire({
            title: "Confirmation",
            text,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Oui, supprimer",
            cancelButtonText: "Annuler",
        })
        return result.isConfirmed
    }
}

export default FeedbackService
