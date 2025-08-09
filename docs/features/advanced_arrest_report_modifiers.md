# **Feature Name**: Advanced Arrest Report - Modifiers

We're going to be focusing on the advanced arrest report modifiers, this document defines each of the modifiers and what it does.

1. Marked Unit?
- Unchecked: SOURCE OF ACTIVITY - Text: I was driving an unmarked vehicle.
- Checked: SOURCE OF ACTIVITY - Text: I was driving a marked black and white with a rooftop light bar. (Check stipulation #2)

2. Slicktop?
(Appears only if #1 checked)
- Unchecked: SOURCE OF ACTIVITY - Text: I was driving a marked black and white with a rooftop light bar.
- Checked: SOURCE OF ACTIVITY - Text: I was driving a marked black and white slicktop.

3. In Uniform?
- Unchecked: SOURCE OF ACTIVITY - Text: I was wearing plain clothes and was openly displaying my badge. (Check stipulation #4)
- Checked: SOURCE OF ACTIVITY - Text: I was wearing my department-issued patrol uniform and was openly displaying my badge of office on my uniform. (Check stipulation #5)

4. Undercover?
(Only appears if #3 unchecked)
- Unchecked: SOURCE OF ACTIVITY - Text: I was wearing plain clothes and was openly displaying my badge.
- Checked: SOURCE OF ACTIVITY - Text: I was wearing plain clothes.

5. In Metro Uniform?
(Only appears if #3 checked)
- Unchecked: SOURCE OF ACTIVITY - Text: I was wearing my department-issued patrol uniform and was openly displaying my badge of office on my uniform.
- Checked: SOURCE OF ACTIVITY - Text: I was wearing my department-issued metropolitan BDU uniform and was openly displaying my badge of office on my uniform. (Check stipulation #6)

6. In G3 Uniform?
(Only appears if #5 checked)
- Unchecked: SOURCE OF ACTIVITY - Text: I was wearing my department-issued metropolitan BDU uniform and was openly displaying my badge of office on my uniform.
- Checked: SOURCE OF ACTIVITY - Text: I was wearing my department-issued metropolitan G3 uniform and was openly displaying my badge of office on my uniform.

7. Was Suspect In Vehicle?
- Unchecked: INVESTIGATION - Text: At approximately <time> hours, I was driving on <street>
- Checked: INVESTIGATION - Inputs: <VEHICLE COLOR>, <VEHICLE MODEL>, <VEHICLE PLATE>
- Checked: INVESTIGATION - Text: At approximately <time> hours, I was driving on <street> when I observed a <VEHICLE COLOR> <VEHICLE MODEL>, with <VEHICLE PLATE> (if plates empty then "no") plates.

8. Was Suspect Mirandarized?
- Unchecked: ARREST - Text: N/A
- Checked: ARREST - Text: I admonished <name> utilizing my Field Officer’s Notebook, reading the following, verbatim:
“You have the right to remain silent. Anything you say may be used against you in a court of law. You have the right to the presence of an attorney during any questioning. If you cannot afford an attorney, one will be appointed to you, free of charge, before any questioning, if you want. Do you understand?” (Check stipulation #9)

9. Did Suspect Understand Rights?
(only shows if #8 checked)
- Unchecked: ARREST - Text - Appended to the end of the miranda rights - <name> responded negatively.
- Checked: ARREST - Text: Appended to the end of the miranda rights - <name> responded affirmativly.

10. Do You Have A Video?
- Unchecked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: N/A
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Input: DICVS Footage Link(s)
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: My Digital In-Car Video (DICV) was activated during this investigation - <input>

11. Did You Obtain Photographs?
- Unchecked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: N/A
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Input: Photographs Link
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: I took photographs using my Department-issued cell phone - <input>

12. Did You Obtain CCTV Footage?
- Unchecked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: N/A
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Input: CCTV Footage Link
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: I obtained closed-circuit television (CCTV) footage - <input>

13. Third Party Video Footage?
- Unchecked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: N/A
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Input: Third Party Footage Link
- Checked: PHOTOGRAPHS, VIDEOS, IN-CAR VIDEO (DICV), and DIGITAL IMAGING - Text: I obtained third party video footage - <input>

14. Did You Transport?
- Unchecked: ARREST - Inputs: <Dropdown: Rank> <Name of Transporting Officer?>
- Unchecked: ARREST - Text: <rank, name> transported <suspect> to Mission Row Station.
- Checked: ARREST - Text: I transported <suspect> to Mission Row Station.

15. Did You Book?
- Unchecked: BOOKING - Inputs: <Dropdown: Rank> <Name of Booking Officer?>
- Unchecked: BOOKING - Text: <rank, name> booked <suspect> on all of the charges listed under the ARREST sub-heading.
During booking, <rank, name> took 10 fingerprint samples from Doe and entered them into the Automated Fingerprint Identification System (AFIS). (Check stipulation #16)
As <suspect> was booked on a felony charge, changeme took a Bode SecurSwab 2 Deoxyribonucleic acid (DNA) profile from him. (Only if charge is a felony + check stipulation #16)
<rank, name> submitted this profile to the Combined DNA Index System (CODIS). (Only if charge is a felony + check stipulation #16)
- Checked: BOOKING - Text: I booked <suspect> on all of the charges listed under the ARREST sub-heading.
During booking, I took 10 fingerprint samples from <suspect> and entered them into the Automated Fingerprint Identification System (AFIS). (Only if charge is a felony + check stipulation #16)
As <suspect> was booked on a felony charge, I took a Bode SecurSwab 2 Deoxyribonucleic acid (DNA) profile from him.
I submitted this profile to the Combined DNA Index System (CODIS). (Only if charge is a felony + check stipulation #16)

16. Biometrics already on file?
- Unchecked: - Unchecked: BOOKING - Text: During booking, <stipulation 15> took 10 fingerprint samples from Doe and entered them into the Automated Fingerprint Identification System (AFIS).
As <suspect> was booked on a felony charge, changeme took a Bode SecurSwab 2 Deoxyribonucleic acid (DNA) profile from him. (Only if charge is a felony)
<stipulation 15> submitted this profile to the Combined DNA Index System (CODIS). (Only if charge is a felony)
- Checked: BOOKING - Text: <suspect>'s (check grammar here) full biometrics, including fingerprints and DNA, were already on file, streamlining the booking process.