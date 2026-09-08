import { useState, useEffect } from "react";


const AVAILABLE_ACTIONS = [

    "Nettoyage_systeme",

    "Suppression_virus_ou_malware",

    "Installation_logiciel",

    "Reinstallation_systeme",

    "Remplacement_materiel",

    "Configuration_reseau",

    "Sauvegarde_ou_Restauration",

    "Mise_a_jour_systeme",

    "Autre"
];


export default function ActionSelector({

    value = [],

    onChange

}) {

    const [selectedActions, setSelectedActions] = useState([]);

    const [otherText, setOtherText] = useState("");


    /*
    =========================================================
    INIT VALUE
    =========================================================
    */

    useEffect(() => {

        if (Array.isArray(value)) {

            setSelectedActions(value);

            const other = value.find(
                (a) => !AVAILABLE_ACTIONS.includes(a)
            );

            if (other) {
                setOtherText(other);
            }
        }

    }, [value]);


    /*
    =========================================================
    TOGGLE ACTION
    =========================================================
    */

    const toggleAction = (action) => {

        let updated = [];

        if (selectedActions.includes(action)) {

            updated = selectedActions.filter(
                (a) => a !== action
            );

        } else {

            updated = [...selectedActions, action];
        }


        /*
        -----------------------------------------
        REMOVE OTHER TEXT IF AUTRE UNCHECKED
        -----------------------------------------
        */

        if (!updated.includes("Autre")) {

            updated = updated.filter(
                (a) => a !== otherText
            );

            setOtherText("");
        }

        setSelectedActions(updated);

        emitChange(updated);
    };


    /*
    =========================================================
    OTHER TEXT
    =========================================================
    */

    const handleOtherText = (e) => {

        const text = e.target.value;

        setOtherText(text);

        let updated = selectedActions.filter(
            (a) => !AVAILABLE_ACTIONS.includes(a)
        );

        updated = selectedActions.filter(
            (a) => AVAILABLE_ACTIONS.includes(a)
        );

        if (text.trim() !== "") {

            updated.push(text);
        }

        setSelectedActions(updated);

        emitChange(updated);
    };


    /*
    =========================================================
    EMIT CHANGE
    =========================================================
    */

    const emitChange = (actions) => {

        if (onChange) {

            onChange(actions);
        }
    };


    return (

        <div className="action-selector">

            <h3>Actions réalisées</h3>

            <div className="actions-grid">

                {AVAILABLE_ACTIONS.map((action) => (

                    <label
                        key={action}
                        className="action-item"
                    >

                        <input
                            type="checkbox"
                            checked={selectedActions.includes(action)}
                            onChange={() => toggleAction(action)}
                        />

                        {action.replaceAll("_", " ")}

                    </label>
                ))}

            </div>


            {
                selectedActions.includes("Autre") && (

                    <div className="other-action-container">

                        <input
                            type="text"
                            placeholder="Décrire l'action..."
                            value={otherText}
                            onChange={handleOtherText}
                        />

                    </div>
                )
            }

        </div>
    );
}