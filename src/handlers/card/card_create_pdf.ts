import type { IncomingMessage, ServerResponse } from "node:http";
import type { Handler } from "../../shared_type/handler.js";
import type { RouteContext } from "../../controllers/router.js";
import { sendError, sendResponse } from "../../shared_functions/send.js";
import { errors, resolveDatabaseError } from "../../configs/errors.js";
import { CardCreateItem, CardCreateText } from "../../definitions/responses.js";
import { getRawBody } from "../../shared_functions/request.js";
import { checkSession } from "../../shared_functions/check_session.js";
import { saveFile } from "../../shared_functions/file.js";
import { converters } from "../../shared_functions/converters.js";
import { extractPdfText, makePdfExtractArgs } from "../../services/pdf_text_extraction.js";
import { extractWords } from "../../shared_functions/text.js";

export const card_create_pdf_handler: Handler = async (req: IncomingMessage, res: ServerResponse, ctx: RouteContext) => {
    try {
        const raw = await getRawBody(req);
        const pdf = converters.toPdf(raw);
        if (pdf == null) {
            sendError(req, res, errors.invalidPdf);
            return;
        }

        const owner = await checkSession(ctx.token);
        if (owner == null) {
            sendError(req, res, errors.invalidOrExpiredToken);
            return;
        }

        const result = await saveFile(pdf.data, pdf.fileName, "pdf", owner);
        if (result == null) {
            sendError(req, res, errors.notFound);
            return;
        }
        const text = await extractPdfText(makePdfExtractArgs(result.source, 100, 1))
        if (text.ok) {
            const words = extractWords(text.text!)
            // console.log(words)
        }

        const response = [
            CardCreateItem('embody', 'to represent or express an idea, quality, or principle in a clear and concrete form; to be a good example of something'),
            CardCreateItem('principle', 'a basic idea, rule, or belief that guides the way something is done or how someone behaves'),
            CardCreateItem('mapmaking', 'the process or activity of creating maps that represent geographical areas, places, or physical features'),
            CardCreateItem('identical', 'exactly the same in appearance, characteristics, or nature, with no meaningful difference between two or more things'),
            CardCreateItem('overlap', 'to partly cover the same area, subject, or range as something else, so that the two things share some of the same parts'),
            CardCreateItem('coverage', 'the extent to which something includes, reaches, or deals with a particular area, subject, or group'),
            CardCreateItem('consistent', 'always behaving, appearing, or being done in the same way, without unexpected changes or contradictions'),
            CardCreateItem('singular', 'extremely unusual, distinctive, or unique; different from what is normally found or expected'),
            CardCreateItem('editorial', 'relating to the process of selecting, correcting, organizing, or controlling the content of a publication or other form of information'),
            CardCreateItem('standard', 'an accepted level of quality, method, or practice that is used as a basis for comparison or as a rule to follow'),
            CardCreateItem('cosmography', 'the study and description of the universe and its major features, especially through geographical or map-based representation'),
            CardCreateItem('collection', 'a group of objects, materials, or works that have been gathered together, usually because they are related or have a particular purpose'),
            CardCreateItem('projection', 'a mathematical or graphical method of representing the curved surface of the Earth on a flat map'),
            CardCreateItem('assume', 'to accept or believe that something is true or likely to be true without having complete proof or evidence'),
            CardCreateItem('powerful', 'having a strong effect, influence, or ability to change or control something'),
            CardCreateItem('cartographic', 'relating to cartography, the science, art, and techniques involved in making and studying maps'),
            CardCreateItem('subsume', 'to include something as part of a larger or more general category, system, or idea, often causing the smaller thing to lose some of its separate importance'),
            CardCreateItem('device', 'an object, tool, method, or system designed or used for a particular purpose'),
            CardCreateItem('adopt', 'to begin to use, accept, or follow a particular idea, method, system, or practice'),
            CardCreateItem('cartographer', 'a person whose job or area of expertise is creating, designing, studying, or updating maps'),
            CardCreateItem('name', 'to give a person, place, object, or thing a particular word or title by which it can be identified'),
            CardCreateItem('select', 'to choose something or someone from a group because it is considered suitable, appropriate, or preferable'),
            CardCreateItem('undertake', 'to accept responsibility for and begin a particular task, activity, or project, especially one that requires effort or commitment'),
            CardCreateItem('cartography', 'the science, art, and practice of making, designing, interpreting, and studying maps'),
            CardCreateItem('mappable', 'able to be represented accurately or meaningfully on a map'),
            CardCreateItem('orb', 'a round or spherical object; in this context, a celestial body such as a planet'),
            CardCreateItem('appear', 'to become visible, noticeable, or present, especially when something comes into view or is shown for the first time'),
            CardCreateItem('flatten', 'to make something flat or change a curved or three-dimensional form into a flatter, two-dimensional form'),
            CardCreateItem('according to', 'based on the information, ideas, rules, or principles provided by a particular person, source, or system'),
            CardCreateItem('succeed', 'to achieve what you intended or wanted to achieve, especially after making an effort or overcoming difficulties'),
            CardCreateItem('reconcile', 'to successfully combine, balance, or make compatible two things that initially seem different, conflicting, or difficult to combine'),
            CardCreateItem('sphere', 'a perfectly round three-dimensional object in which every point on its surface is the same distance from its center; here, it refers to the Earth as a globe'),
            CardCreateItem('plane', 'a completely flat, two-dimensional surface extending in space; in the passage, it contrasts with the Earth’s curved spherical surface'),
            CardCreateItem('envelop', 'to completely surround, cover, or contain something, so that it is enclosed by or wrapped within something else'),
            CardCreateItem('integrate', 'to combine separate parts, ideas, or systems so that they work together as a unified and effective whole'),
            CardCreateItem('mapping', 'the process of representing geographical locations, features, or relationships on a map; more generally, the process of creating a visual representation of an area')
        ];

        sendResponse(req, res, 201, CardCreateText(response.length, response));
    }
    catch (e) {
        console.log("Error: ", e);
        sendError(req, res, resolveDatabaseError(e));
    }
}
