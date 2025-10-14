import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import Handlebars from "handlebars";
import { array } from "zod";
import { addDays, format } from "date-fns";

let helpersRegistered = false;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function registerHelpers(): void {
  if (helpersRegistered) return;
  helpersRegistered = true;
  Handlebars.registerHelper('lookup', (obj, key) => obj && obj[key]);
  Handlebars.registerHelper('with', function(this: any, context, options) {
      return options.fn(context);
  });
  Handlebars.registerHelper('if', function(this: any, conditional, options) {
      if (conditional) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });
  Handlebars.registerHelper('or', function(this: any, a, b, options) {
      if (a || b) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });
  Handlebars.registerHelper('and', function(this: any, a, b, options) {
      if (a && b) {
          return options.fn(this);
      } else {
          return options.inverse(this);
      }
  });
  Handlebars.registerHelper('eq', (a, b) => a === b);
  Handlebars.registerHelper('each', function(context, options) {
      let ret = "";
      if (Array.isArray(context)) {
          for(let i = 0; i < context.length; i++) {
              // Pass index and other helpful properties to the template
              const data = options.data ? Handlebars.createFrame(options.data) : {};
              data.index = i;
              data.index_1 = i + 1;
              data.first = (i === 0);
              data.last = (i === context.length - 1);
              ret = ret + options.fn(context[i], { data: data });
          }
      }
      return ret;
  });
  Handlebars.registerHelper('any', function(this: any, context, options) {
    if (Array.isArray(context) && context.length > 0) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  })
  Handlebars.registerHelper('is_in', (array, value) => array?.includes(value));
  Handlebars.registerHelper('addDays', (dateString, days) => {
    try {
        const date = new Date(dateString);
        const newDate = addDays(date, days);
        return format(newDate, 'dd/MMM/yyyy').toUpperCase();
    } catch(e) {
        // if date is invalid, try with today
        try {
            const today = new Date();
            const newDate = addDays(today, days);
            return format(newDate, 'dd/MMM/yyyy').toUpperCase();
        } catch (e2) {
            return 'INVALID DATE';
        }
    }
  });
}
