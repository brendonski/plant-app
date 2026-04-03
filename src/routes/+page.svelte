<div class="home-page">
	<h1>Garden Bed Management</h1>
	<p class="subtitle">Manage your garden beds and track plant locations</p>

	<div class="navigation-cards">
		<a href="/beds" class="card">
			<h2>🌱 Manage Beds</h2>
			<p>Add, edit, and remove garden beds</p>
		</a>

		<a href="/plants" class="card">
			<h2>🌸 Plant Records</h2>
			<p>Record plant details and photos</p>
		</a>
	</div>
</div>

<style>
	.home-page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 3rem 2rem;
		text-align: center;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.subtitle {
		font-size: 1.2rem;
		color: #666;
		margin-bottom: 3rem;
	}

	.navigation-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		max-width: 800px;
		margin: 0 auto;
	}

	.card {
		padding: 2rem;
		border: 2px solid #ddd;
		border-radius: 12px;
		background: white;
		transition: all 0.2s;
		text-decoration: none;
		color: inherit;
		display: block;
	}

	a.card:hover {
		border-color: #007bff;
		box-shadow: 0 4px 12px rgba(0, 123, 255, 0.2);
		transform: translateY(-2px);
	}

	.card h2 {
		font-size: 1.5rem;
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.card p {
		margin: 0;
		color: #666;
	}
</style>
