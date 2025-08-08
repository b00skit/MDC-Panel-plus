# **Module Name**: Advanced Arrest Report

We're going to be seperating a basic arrest report from the advanced arrest report, this will be done on the arrest-report page with a toggle.

## Instructions:
- This will be implemented within phases, work on the phase you've been instructed to work on, don't worry about the other phases but feel free to take in the information for more context.

## Phase 1:
- Create a toggle below the disclaimer on the arrest report, the toggle should switch between the basic and advanced version of the arrest report.
- The toggle state should be saved into someone's localstorage.
- The arrest report's frontend should be designed after docs/extras/arrest_report_sample.html, but make sure that the style matches the app.

## Phase 2:
- Ensure you autofill the date & time based on the same way that it does in the basic report.
- The location should be divided into two drop-downs, where you can select the location or manually type in the location.
- The first handling officer should automatically be pre-filled based on the localstorage data, similarly, some sort of quickswap feature should be added for alternative characters, change the rank input field into a dropdown.
- The charges should be pre-filled based on what you selected in the calculator, the fields should be disabled and changed into input fields.
- The div/detail should also be saved into someone's localstorage for that character.
- The add officer / add person buttons, delete buttons and everything else should have proper functionality for this feature.
- Remove the "Specify Your Shop" modifier.

## Phase 3:
- Implement a preset system, based on me filling out the report, if a preset is enabled, then for example I can utilize the arrest report modifiers to enhance the report where it would normally type out the things.
- Observe docs/extra/arrest_report_filled.html for exact information as to what I mean, pay attention to how I filled out certain things and the textareas changed based on what I've put in.
- Use a bit of common sense with the modifiers, for example if I don't have a video, you can remove the preset for a video and replace it with this:
<tr><td colspan="5"><textarea class="flex min-h-[60px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 w-full" placeholder="(( You may use this section if you don't have a video recording of what happened. Describe what the dashcam would capture. If you have a video, select 'Do You Have A Video?' in the Arrest Report Modifiers. Lying in this section will lead to OOC punishments. ))" rows="3" name="dicvs_footage_text" spellcheck="false"></textarea></td></tr>