# What is ionicResearchKit?

An open source library equivalent of Apple's [ResearchKit Framework](https://github.com/ResearchKit/ResearchKit) built on [Ionic](https://github.com/driftyco/ionic) which makes it easy to create cross-platform hybrid native apps for medical or non-medical research and for other survey-type projects.

# App Showcase

- MIT Voice Up - allows users to track various aspects of their mental health through a series of survey questions and speech prompts.

[Get it on iTunes](https://itunes.apple.com/us/app/mit-voice-up/id1160735265?ls=1&mt=8)

[Get it on Google Play](https://play.google.com/store/apps/details?id=edu.mit.voiceup)

- Civique.org - the platform helps cities and organizations to create challenges on topics that matter to citizens and communities which also helps them document their cause, make sense of their data, and engage with people.

[Get it on iTunes](https://itunes.apple.com/ch/app/civique.org/id1119089346?mt=8)

[Get it on Google Play](https://play.google.com/store/apps/details?id=org.civique)

- Bites'n'Bits - a research project of the Ecole Polytechnique Fédérale de Lausanne which aims to understand the modes of consumption and the perception of food and beverages consumed in everyday life.

[Get it on iTunes](https://itunes.apple.com/us/app/bitesnbits/id1132530860?mt=8)

[Get it on Google Play](https://play.google.com/store/apps/details?id=org.civique.nrc&hl=en)

# Demo

[Survey demo](https://youtu.be/U96anI8PA08?rel=0)

[Consent demo](https://youtu.be/lb0yK52kZXs?rel=0)

[Finger Tapping Task demo](https://youtu.be/pANOG-KW2PM?rel=0)

[Audio Task demo](https://youtu.be/f560Pvetbm0?rel=0)

# Ionic Version Compatibility

- Ionic 1.1.x - 1.3.x --> Fully Compatible
- Ionic 2.x --> Not Yet Tested

# Installation

1. Download and import the plugin script.<br />
`<script src="lib/ionic-researchkit/ionic-researchkit.js"></script>`
2. Download and import the plugin stylesheet.<br />
`<link href="lib/ionic-researchkit/ionic-researchkit.css" rel="stylesheet">`
3. Add `ionicResearchKit` to your angular app module dependencies list.<br />
`angular.module('myApp', ['ionicResearchKit']);`

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
    <irk-visual-consent-step id="c9" type="custom" title="Your Title" text="Learn more" summary="Your summary goes here." image="custom-image-class">
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

### Active Task

```
<ion-modal-view class="irk-modal">

<irk-ordered-tasks>

  <irk-task>
    <irk-instruction-step id="a1" title="Tapping Speed" text="This activity measures your tapping speed." button-text="Next" image="irk-phone-tapping" footer-attach="true"/>
  </irk-task>

  <irk-task>
    <irk-instruction-step id="a2" title="Tapping Speed" text="Rest your phone on a flat surface. Two buttons will appear on your screen for 20 seconds. Using two fingers on the same hand, take turns tapping the buttons as quickly as you can." button-text="Get Started" image="irk-hand-tapping" footer-attach="true"/>
  </irk-task>

  <irk-task>
    <irk-two-finger-tapping-interval-task id="a4" duration="10"/>
  </irk-task>

  <irk-task>
    <irk-completion-step id="a5"/>
  </irk-task>

</irk-ordered-tasks>

</ion-modal-view>
```


# Directives

### Survey

`<irk-ordered-tasks>` is the equivalent of the `ORKOrderedTask` class and will encompass one or more `<irk-task>` elements.

`<irk-task>` is the equivalent of the `ORKTask` class and will encompass one of the available `<irk-*-step>` elements.

`<irk-instruction-step>` is the equivalent of the `ORKInstructionStep` class and includes the `id`, `title`, `text`, `link`, `link-text` and `image` attributes.

`<irk-scale-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKScaleAnswerFormat` classes combined and includes the `id`, `title`, `text`, `min`, `max`, `step`, `value`, `min-text`, `max-text`, and `optional` attributes.

`<irk-boolean-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKBooleanAnswerFormat` classes combined and includes the `id`, `title`, `text`, `true-value`, `true-text`, `false-value`, `false-text`, and `optional` attributes.

`<irk-text-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTextAnswerFormat` classes combined and includes the `id`, `title`, `text`, `placeholder`, `max-length`, `multiple-lines`, and `optional` attributes.

`<irk-text-choice-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTextChoiceAnswerFormat` classes  combined and includes the `id`, `title`, `text`, and `optional` attributes. This encompass several `<irk-text-choice>` elements where each include the `value`, `text`, and `detail-text` attributes.

`<irk-numeric-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKNumericAnswerFormat` classes combined and includes the `id`, `title`, `text`, `min`, `max`, `unit`, `placeholder`, and `optional` attributes.

`<irk-date-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKDateAnswerFormat` classes combined and includes the `id`, `title`, `text`, and `optional` attributes.

`<irk-time-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKTimeOfDayAnswerFormat` classes combined and includes the `id`, `title`, `text`, and `optional` attributes.

`<irk-value-picker-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKValuePickerAnswerFormat` classes combined and includes the `id`, `title`, `text`, and `optional` attributes. This encompass several `<irk-picker-choice>` elements where each include the `value`, `text` attributes.

`<irk-image-choice-question-step>` is the equivalent of the `ORKQuestionStep` and `ORKImageChoiceAnswerFormat` classes combined and includes the `id`, `title`, `text`, and `optional` attributes. This encompass several `<irk-image-choice>` elements where each include the `value`, `text`, `type`, `normal-state-image`, `selected-state-image` attributes.

`<irk-form-step>` is the equivalent of the `ORKFormStep` class and includes the `id`, `title`, `text` attributes. This encompass several `<irk-form-item>` elements which are the equivalent of the `ORKFormItem` class and each include the `title`, `id`, `type`, `text` and `placeholder` , and `optional` attributes.

### Consent

`<irk-visual-consent-step>` is the equivalent of the `ORKVisualConsentStep` class.

`<irk-consent-sharing-step>` is the equivalent of the `ORKConsentSharingStep` class.

`<irk-consent-review-step>` is the equivalent of the `ORKConsentReviewStep` class.  Depending on it's `type` attribute, it could encompass either `<irk-consent-name>` or `<irk-consent-signature>` elements which are the broken up equivalent of the `ORKConsentSignature` class.

The consent document PDF is automatically generated as a base64-encoded string and can be retrieved by using `irkConsentDocument.getDocument().getDataUrl()`.

### Active Tasks

`<irk-countdown-step>` is the equivalent of the `ORKCountdownStep` class and supports the `duration` attribute.

`<irk-completion-step>` is the equivalent of the `ORKCompletionStep` class.

`<irk-two-finger-tapping-interval-task>` is the equivalent of the `ORKPredefinedActiveTask` class that is for two finger tapping and supports the `text` and `duration` attributes.

`<irk-audio-task>` is the equivalent of the `ORKPredefinedActiveTask` class that is for audio capture and supports the `text`, `duration`, `auto-record`, `auto-complete`, and `optional` attributes.


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
