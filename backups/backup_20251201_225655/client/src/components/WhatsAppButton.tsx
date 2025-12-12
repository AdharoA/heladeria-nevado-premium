import React from "react";
import "./WhatsAppButton.css";

export default function WhatsAppButton() {
    return (
        <a
            href="https://api.whatsapp.com/send?phone=+51945472993&text=Hola%21%20Quisiera%20m%C3%A1s%20informaci%C3%B3n%20sobre%20Los%20Productos."
            className="float"
            target="_blank"
            rel="noopener noreferrer"
            style={{ bottom: "85px" }}
        >
            <i className="fab fa-whatsapp my-float"></i>
        </a>
    );
}
