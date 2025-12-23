import Swal from "sweetalert2"

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
        FeedbackService.show("success", "Succès", text)
    },

    error: (text = "Une erreur est survenue !") => {
        FeedbackService.show("error", "Erreur", text)
    },

    warning: (text = "Attention !") => {
        FeedbackService.show("warning", "Avertissement", text)
    },

    info: (text = "Information") => {
        FeedbackService.show("info", "Info", text)
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
