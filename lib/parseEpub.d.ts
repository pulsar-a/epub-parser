/// <reference types="node" />
import { Section } from './parseSection';
import { GeneralObject } from './types';
export declare class Epub {
    private _zip;
    private _opfPath?;
    private _root?;
    private _content?;
    private _manifest?;
    private _spine?;
    private _toc?;
    _metadata?: GeneralObject;
    structure?: GeneralObject;
    info?: {
        title: string;
        authors: string[];
        publisher: string;
    };
    sections?: Section[];
    constructor(buffer: Buffer);
    resolve(path: string): {
        asText: () => string;
    };
    _resolveXMLAsJsObject(path: string): Promise<any>;
    private _getOpfPath;
    _getManifest(content: GeneralObject): any[];
    _resolveIdFromLink(href: string): any;
    _getSpine(): any;
    _genStructureForHTML(tocObj: GeneralObject): {
        name: any;
        sectionId: any;
        nodeId: string;
        path: any;
        playOrder: number;
        children: any;
    }[];
    _genStructure(tocObj: GeneralObject, resolveNodeId?: boolean): {
        name: any;
        sectionId: any;
        nodeId: string;
        path: any;
        playOrder: number;
        children: any;
    }[] | {
        name: any;
        sectionId: any;
        nodeId: string;
        path: any;
        playOrder: string;
        children: any;
    }[];
    _resolveSectionsFromSpine(expand?: boolean): Section[];
    parse(expand?: boolean): Promise<this>;
}
export interface ParserOptions {
    type?: 'binaryString' | 'path' | 'buffer';
    expand?: boolean;
}
export default function parserWrapper(target: string | Buffer, options?: ParserOptions): Promise<Epub>;
