import { HtmlNodeObject } from './types';
export declare type ParseSectionConfig = {
    id: string;
    htmlString: string;
    resourceResolver: (path: string) => any;
    idResolver: (link: string) => string;
    expand: boolean;
};
export declare class Section {
    id: string;
    htmlString: string;
    htmlObjects?: HtmlNodeObject[];
    private _resourceResolver?;
    private _idResolver?;
    constructor({ id, htmlString, resourceResolver, idResolver, expand }: ParseSectionConfig);
    toMarkdown?(): any;
    toHtmlObjects?(): HtmlNodeObject[];
}
declare const parseSection: (config: ParseSectionConfig) => Section;
export default parseSection;
