/*
Copyright 2026 by Herbert Potechius,
Technical University of Berlin
Faculty IV - Electrical Engineering and Computer Science - Institute of Telecommunication Systems - Communication Systems Group
All rights reserved.
This file is released under the "MIT License Agreement".
Please see the LICENSE file that should have been included as part of this package.
*/

import "./FileTree.scss";
import FileNode from "./FileNode"

/******************************************************************************************************************
 ******************************************************************************************************************
 ** FUNCTIONAL COMPONENT
 **
 ** Visualizes the file and folder structure of the requested database.
 ******************************************************************************************************************
 ******************************************************************************************************************/
export default function FileTree({ data, expandAll = false }) {
    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    function removeTmpFolders(data) {
        return data.map(node => {
            if (node.folders) {
                node.folders = removeTmpFolders(node.folders).filter(folder => folder.name !== 'tmp');
            }
            return node;
        }).filter(node => node.name !== 'tmp');
    }

    /**************************************************************************************************************
     * 
     **************************************************************************************************************/
    const FileTreeContent = ({ data, expandAll }) => {
        const isHiddenName = (name) => name && name.startsWith(".");

        if (!data) return null;

        // removes all tmp folders from the file tree
        data = removeTmpFolders(data)

        if (Array.isArray(data)) {
            if (data.length === 0) return null;
            if (data.length === 1 && data[0]?.folders) {
                const roots = (data[0].folders || []).filter(
                    (root) => !isHiddenName(root.name)
                );
                return (
                    <div className="file-tree">
                        {roots.map((root, idx) => (
                            <FileNode key={idx} node={root} parentPath="" expandAll={expandAll} isHiddenName={isHiddenName}/>
                        ))}
                    </div>
                );
            }
            return (
                <div className="file-tree">
                    {data.map((node, idx) =>
                        node && node.name ? (
                                <FileNode key={idx} node={node} parentPath="" expandAll={expandAll} isHiddenName={isHiddenName}/>
                        ) : null
                    )}
                </div>
            );
        }

        if (typeof data === "object" && data !== null && data.name) {
            return (
                <div className="file-tree">
                    <FileNode node={data} parentPath="" expandAll={expandAll} isHiddenName={isHiddenName}/>
                </div>
            );
        }

        return null;
    };

    /**************************************************************************************************************
     **************************************************************************************************************
     ** RENDERING
     **************************************************************************************************************
     **************************************************************************************************************/
    return (
        <div className="database_content">
            <FileTreeContent data={data} expandAll={expandAll} />
        </div>
    );
};