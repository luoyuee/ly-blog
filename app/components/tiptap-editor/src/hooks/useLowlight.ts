import { all, createLowlight } from "lowlight";

import css from "highlight.js/lib/languages/css";
import js from "highlight.js/lib/languages/javascript";
import ts from "highlight.js/lib/languages/typescript";
import html from "highlight.js/lib/languages/xml";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import go from "highlight.js/lib/languages/go";
import ruby from "highlight.js/lib/languages/ruby";
import php from "highlight.js/lib/languages/php";
import swift from "highlight.js/lib/languages/swift";
import kotlin from "highlight.js/lib/languages/kotlin";
import rust from "highlight.js/lib/languages/rust";

export const useLowlight = () => {
  const lowlight = createLowlight(all);

  lowlight.register("html", html);
  lowlight.register("css", css);
  lowlight.register("js", js);
  lowlight.register("ts", ts);
  lowlight.register("python", python);
  lowlight.register("java", java);
  lowlight.register("c", c);
  lowlight.register("cpp", cpp);
  lowlight.register("csharp", csharp);
  lowlight.register("go", go);
  lowlight.register("ruby", ruby);
  lowlight.register("php", php);
  lowlight.register("swift", swift);
  lowlight.register("kotlin", kotlin);
  lowlight.register("rust", rust);

  return lowlight;
};
