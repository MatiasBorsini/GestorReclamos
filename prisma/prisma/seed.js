"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// prisma/seed.ts
var client_1 = require("@prisma/client");
var complaint_data_js_1 = require("../lib/complaint-data.js"); // OJO .js si compilado
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, entityName, entidad, categories, _b, _c, categoryName, categoria, subcategories, _d, subcategories_1, subName;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _i = 0, _a = Object.keys(complaint_data_js_1.complaintData);
                    _e.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 10];
                    entityName = _a[_i];
                    return [4 /*yield*/, prisma.entidad.upsert({
                            where: { nombre: entityName },
                            update: {},
                            create: { nombre: entityName },
                        })];
                case 2:
                    entidad = _e.sent();
                    categories = complaint_data_js_1.complaintData[entityName];
                    _b = 0, _c = Object.keys(categories);
                    _e.label = 3;
                case 3:
                    if (!(_b < _c.length)) return [3 /*break*/, 9];
                    categoryName = _c[_b];
                    return [4 /*yield*/, prisma.categoria.upsert({
                            where: { nombre_entidadId: { nombre: categoryName, entidadId: entidad.id } },
                            update: {},
                            create: { nombre: categoryName, entidadId: entidad.id },
                        })];
                case 4:
                    categoria = _e.sent();
                    subcategories = categories[categoryName];
                    _d = 0, subcategories_1 = subcategories;
                    _e.label = 5;
                case 5:
                    if (!(_d < subcategories_1.length)) return [3 /*break*/, 8];
                    subName = subcategories_1[_d];
                    return [4 /*yield*/, prisma.subCategoria.upsert({
                            where: { nombre_categoriaId: { nombre: subName, categoriaId: categoria.id } },
                            update: {},
                            create: { nombre: subName, categoriaId: categoria.id },
                        })];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7:
                    _d++;
                    return [3 /*break*/, 5];
                case 8:
                    _b++;
                    return [3 /*break*/, 3];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10:
                    console.log("Base de datos poblada ✅");
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(console.error)
    .finally(function () { return prisma.$disconnect(); });
