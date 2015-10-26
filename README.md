# What is ionicResearchKit?

An open source library equivalent of Apple's [ResearchKit Framework](https://github.com/ResearchKit/ResearchKit) built on [Ionic](https://github.com/driftyco/ionic) which makes it easy to create cross-platform hybrid native apps for medical research or for other research projects.

# Installation

1. Download and import the plugin script.<br />
`<script src="lib/ionic-researchkit/ionic-researchkit.js"></script>`
2. Download and import the plugin stylesheet.<br />
`<link href="lib/ionic-researchkit/ionic-researchkit.css" rel="stylesheet">`
3. Add `ionicResearchKit` to your angular app module dependencies list.<br />
`angular.module('myApp', ['ionicResearchKit']);`

# Dependencies

- checklist-model [https://github.com/vitalets/checklist-model](https://github.com/vitalets/checklist-model)
- signature_pad [https://github.com/szimek/signature_pad](https://github.com/szimek/signature_pad)

# Usage

1. Add a modal view to your app using [$ionicModal](http://ionicframework.com/docs/api/service/$ionicModal/)
2. Add the following to your modal view template:

### Survey

```
<ion-modal-view class="irk-modal">

  <irk-ordered-tasks>
	
    <irk-task>
    	<irk-instruction-step id="s1" title="Your title here." text="Additional text can go here." />
  	</irk-task>

	  <irk-task>
    	<irk-scale-question-step id="q1" title="Your question here." text="Additional text can go here." 
    	    min="1" max="10" step="1" value="5" />
  	</irk-task>

  	<irk-task>
    	<irk-boolean-question-step id="q2" title="Your question here." text="Additional text can go here." 
    	    true-text="Yes" false-text="No" />
	  </irk-task>

    <irk-task>
      <irk-text-question-step id="q3" title="Your question here." text="Additional text can go here." />
    </irk-task>

    <irk-task>
      <irk-text-question-step id="q4" title="Your question here." text="Additional text can go here." multiple-lines="false" />
    </irk-task>

    <irk-task>
      <irk-text-choice-question-step id="q5" title="Your question here." text="Additional text can go here." style="single">
        <irk-text-choice text="Choice 1" value="1"></irk-text-choice>
        <irk-text-choice text="Choice 2" value="2"></irk-text-choice>
        <irk-text-choice text="Choice 3" value="3" detail-text="Additional text can go here."></irk-text-choice>
      </irk-text-choice-question-step>
    </irk-task>

    <irk-task>
      <irk-text-choice-question-step id="q5" title="Your question here." text="Additional text can go here." style="multiple">
        <irk-text-choice text="Choice 1" value="1"></irk-text-choice>
        <irk-text-choice text="Choice 2" value="2"></irk-text-choice>
        <irk-text-choice text="Choice 3" value="3" detail-text="Additional text can go here."></irk-text-choice>
      </irk-text-choice-question-step>
    </irk-task>

    <irk-task>
      <irk-numeric-question-step id="q6" title="Your question here." text="Additional text can go here." unit="Your unit." />
    </irk-task>

    <irk-task>
      <irk-date-question-step id="q7" title="Your question here." text="Additional text can go here." />
    </irk-task>

    <irk-task>
      <irk-time-question-step id="q8" title="Your question here." text="Additional text can go here." />
    </irk-task>

    <irk-task>
      <irk-value-picker-question-step id="q9" title="Your question here." text="Additional text can go here." >
        <irk-picker-choice text="Choice 1" value="1"></irk-picker-choice>
        <irk-picker-choice text="Choice 2" value="2"></irk-picker-choice>
        <irk-picker-choice text="Choice 3" value="3"></irk-picker-choice>
      </irk-value-picker-question-step>
    </irk-task>

    <irk-task>
      <irk-image-choice-question-step id="q10" title="Your question here." text="Additional text can go here." >
        <irk-image-choice text="Choice 1" value="1" normal-state-image="ion-sad-outline" selected-state-image="ion-sad"></irk-image-choice>
        <irk-image-choice text="Choice 2" value="2" normal-state-image="ion-happy-outline" selected-state-image="ion-happy"></irk-image-choice>
      </irk-image-choice-question-step>
    </irk-task>

    <irk-task>
      <irk-form-step id="q11" title="Your question here." text="Additional text can go here." >
        <irk-form-item title="Your section title."></irk-form-item>
        <irk-form-item type="text" id="firstName" text="First Name" placeholder="John"></irk-form-item>
        <irk-form-item type="text" id="lastName" text="Last Name" placeholder="Suhr"></irk-form-item>
        <irk-form-item title="Your section title."></irk-form-item>
        <irk-form-item type="email" id="email" text="Email" placeholder="john@suhr.com"></irk-form-item>
        <irk-form-item type="tel" id="phone" text="Phone" placeholder="555-555-5555"></irk-form-item>
      </irk-form-step>
    </irk-task>

    <irk-task>
      <irk-instruction-step id="s2" title="Your title here." text="Additional text can go here." button-text="Done" />
    </irk-task>

  </irk-ordered-tasks>

</ion-modal-view>
```

### Consent

```
<ion-modal-view class="irk-modal">

  <irk-ordered-tasks>

  <irk-task>
    <irk-visual-consent-step id="c1" type="overview" summary="Your summary goes here.">
      1. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c2" type="data-gathering" summary="Your summary goes here.">
      2. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c3" type="privacy" summary="Your summary goes here.">
      3. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c4" type="data-use" summary="Your summary goes here.">
      4. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c5" type="time-commitment" summary="Your summary goes here.">
      5. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c6" type="study-survey" summary="Your summary goes here.">
      6. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c7" type="study-tasks" summary="Your summary goes here.">
      7. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c8" type="withdrawing" summary="Your summary goes here.">
      8. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-visual-consent-step id="c9" type="custom" title="Your Title" text="Learn more" summary="Your summary goes here.">
      9. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
    <irk-visual-consent-step id="c9.1" type="only-in-document" title="Your Title (In Document Only)">
      9.1 Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-visual-consent-step>
  </irk-task>

  <irk-task>
    <irk-consent-sharing-step id="c10" summary="Your summary goes here." investigator-short-description="YourInstitution" investigator-long-description="YourInstitution and its partners" investigator-short-value="0" investigator-long-value="1" >
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam adhuc, meo fortasse vitio, quid ego quaeram non perspicis. Plane idem, inquit, et maxima quidem, qua fieri nulla maior potest. Quonam, inquit, modo?
    </irk-consent-sharing-step>
  </irk-task>    
  
  <irk-task>
    <irk-consent-review-step id="c11" type="review" title="Your Title" reason-for-consent="Lorem ipsum dolor sit amet..."></irk-consent-review-step>
  </irk-task>

  <irk-task>
    <irk-consent-review-step id="c12" type="name" text="Lorem ipsum dolor sit amet..." signature-page-title="Consent" signature-page-content="I agree to participate in this research study.">
      <irk-consent-name id="s1" title="Participant" given-name="" family-name="" requires-name="true"/>
    </irk-consent-review-step>
  </irk-task>

  <irk-task>
    <irk-consent-review-step id="c13" type="signature">
      <irk-consent-signature id="s1" signatureImage="" signatureDate="" signature-date-format="" requires-signature-image="true"/>
    </irk-consent-review-step>
  </irk-task>

  </irk-ordered-tasks>

</ion-modal-view>
```

# Directives

### Survey

`<irk-ordered-tasks>` is the equivalent of the `ORKOrderedTask` class and will encompass one or more `<irk-task>` elements.

`<irk-task>` is the equivalent of the `ORKTask` class and will encompass one of the available `<irk-*-step>` elements.

`<irk-instruction-step>` is the equivalent of the `ORKInstructionStep` class and includes the `id`, `title` and `text` attributes.

`<irk-scale-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKScaleAnswerFormat` classes combined and includes the `id`, `title`, `text`, `min`, `max`, `step`, `value`, `min-text`, and `max-text` attributes.

`<irk-boolean-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKBooleanAnswerFormat` classes combined and includes the `id`, `title`, `text`, `trueText`, and `falseText` attributes.

`<irk-text-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTextAnswerFormat` classes combined and includes the `id`, `title`, `text`, `maxLength`, and `multipleLines` attributes.

`<irk-text-choice-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTextChoiceAnswerFormat` classes  combined and includes the `id`, `title`, `text`, and `style` attributes. This encompass several `<irk-text-choice>` elements where each include the `value`, `text`, and `detail-text` attributes.

`<irk-numeric-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKNumericAnswerFormat` classes combined and includes the `id`, `title`, `text`, `min`, `max`, and `unit` attributes.

`<irk-date-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKDateAnswerFormat` classes combined and includes the `id`, `title`, `text` attributes.

`<irk-time-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTimeOfDayAnswerFormat` classes combined and includes the `id`, `title`, `text` attributes.

`<irk-value-picker-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKValuePickerAnswerFormat` classes combined and includes the `id`, `title`, `text` attributes. This encompass several `<irk-picker-choice>` elements where each include the `value`, `text` attributes.

`<irk-image-choice-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKImageChoiceAnswerFormat` classes combined and includes the `id`, `title`, `text` attributes. This encompass several `<irk-image-choice>` elements where each include the `value`, `text`, `type`, `normal-state-image`, `selected-state-image` attributes.

`<irk-form-step>` is the equivalent of the `ORKFormStep` class and includes the `id`, `title`, `text` attributes. This encompass several `<irk-form-item>` elements which are the equivalent of the `ORKFormItem` class and each include the `title`, `id`, `type`, `text` attributes.

### Consent

`<irk-visual-consent-step>` is the equivalent of the `ORKVisualConsentStep` class.

`<irk-consent-sharing-step>` is the equivalent of the `ORKConsentSharingStep` class.

`<irk-consent-review-step>` is the equivalent of the `ORKConsentReviewStep` class.  Depending on it's `type` attribute, it could encompass one or more `<irk-consent-signature>` elements which are the equivalent of the `ORKConsentSignature` class.

# Demo

### Survey
![Survey demo](https://cloud.githubusercontent.com/assets/4361804/10489873/9c77f440-7253-11e5-951c-5826a767d0f6.gif)

### Consent
![Consent demo](https://cloud.githubusercontent.com/assets/4361804/10498955/693a729a-7282-11e5-938c-b03714ce836d.gif)

*Click [here](https://youtu.be/-NLjgpvtHK0) to watch app demo on YouTube.*

# Roadmap

- [x] Task View equivalent 
- [x] Survey directives
  - [x] Instruction Step directive
    - [ ] Support optional image
  - [x] Scale Question Step directive
    - [ ] Support step bars
    - [ ] Support vertical orientation
  - [x] Boolean Question Step directive
  - [x] Text Question Step directive
    - [x] Multi lines
    - [x] Single line
  - [x] Text Choice Question Step directive
    - [x] Single choice
    - [x] Multiple choice
  - [x] Numeric Question Step directive
  - [x] Date Question Step directive
  - [x] Time Question Step directive
    - [ ] Time Interval Question Step directive
  - [x] Value Picker Question Step directive
  - [x] Image Choice Question Step directive
    - [x] Support icons
    - [x] Support images
  - [x] Form Step directive
    - [ ] Support more answer formats
- [ ] Consent directives
  - [x] Visual Consent
    - [x] In Document Only Type
    - [ ] Support custom image
  - [x] Consent Sharing
  - [x] Consent Review
    - [x] Name Capture
    - [x] Signature Capture
  - [ ] PDF Generation
- [ ] Active Tasks directives
- [x] Results
  - [x] Output results in JSON
  - [ ] Collect results into LocalStorage
- [ ] Integrations
  - [ ] HealthKit
  - [ ] Google Fit
  - [ ] Samsung S Health

License
=======

The source in the Ionic-ResearchKit repository is made available under the
following license unless another license is explicitly identified:

```
The MIT License (MIT)

Copyright (c) 2015 Nino Guba

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
```
