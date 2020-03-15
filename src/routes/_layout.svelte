<script>
	//import {setContext} from "svelte";

	import Dashboard from "/Components/Dashboard.svelte";

	import Alternates from "/Components/Alternates.svelte";

	import {stores} from "@sapper/app";
	const {page, session} = stores();

	import * as i18n from "/Common/i18n";
	const {lang, trans, countryCode} = i18n.stores();
</script>

<Alternates/>

<Dashboard>
	<slot/>
</Dashboard>