/*
Copyright 2025 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./SettingsFieldItem.scss";

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** One setting item for the loaded data.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function SettingsFieldItem({type, defaultValue, onChange, min, max, value, children}) {
    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return(
        <tr className="field_settings_item">
            <td className='field_settings_table_cell'>{children}</td>
            <td className='field_settings_table_cell'>
            {
                type === "button"
                    ? (
                        Array.isArray(label) && Array.isArray(onClick)
                            ? (
                                <div
                                    style={{
                                        display: "flex",
                                        gap: "4px",
                                        width: "100%",
                                    }}
                                >
                                    {label.map((lbl, idx) => (
                                        <button
                                            key={idx}
                                            onClick={onClick[idx]}
                                            style={{
                                                padding: "3px 6px",
                                                whiteSpace: "nowrap",
                                                flex: "1 1 0",
                                            }}
                                        >
                                            {lbl ?? "Button"}
                                        </button>
                                    ))}
                                </div>
                            )
                            : (
                                <button
                                    onClick={onClick}
                                    style={{ width: "100%", padding: "3px" }}
                                >
                                    {label ?? "Button"}
                                </button>
                            )
                    )
                    : (
                        <input
                            type={type}
                            defaultChecked={defaultValue}
                            onChange={onChange}
                            {...(type !== 'range' ? { defaultChecked: defaultValue } : {})}
                            {...(type === 'range' ? { 
                                min: min, 
                                max: max, 
                                ...(defaultValue !== undefined ? { defaultValue: defaultValue } : {}),
                                ...(value !== undefined ? { value: value } : {})
                            } : {})}
                        />
                    )
                }
            </td>
        </tr>
    )
}