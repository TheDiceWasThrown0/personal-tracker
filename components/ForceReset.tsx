"use client"

import { useEffect } from "react"

export function ForceReset() {
    useEffect(() => {
        // Check if we've already reset for version 3
        if (!localStorage.getItem("reset_v3")) {
            console.log("Resetting data for Version 3 Detailed Roadmap...")
            localStorage.removeItem("roadmap_phases")
            localStorage.removeItem("status_netWorth")
            localStorage.removeItem("status_gpa")
            localStorage.removeItem("status_gmat")
            localStorage.removeItem("status_gpaTarget")
            localStorage.setItem("reset_v3", "true")
            window.location.reload()
        }
    }, [])

    return null
}
